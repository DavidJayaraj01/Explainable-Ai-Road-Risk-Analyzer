import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
import pytest

from src.features.build_task_a import build_task_a_dataset, sample_controls_for_cases
from src.features.build_task_b import parse_uk_datetime_to_utc
from src.features.spatial_join import FastSpatialMatcher, haversine_distance_km
from src.models.calibrate import apply_prior_correction
from src.models.evaluate import compute_binary_metrics
from src.explain.stability import compute_rank_metrics


def test_datetime_utc_alignment():
    """Verify UK local datetime (BST UTC+1 and GMT UTC+0) correctly converts to UTC."""
    # Summer (BST = UTC+1): 12:00 BST should be 11:00 UTC
    dates_summer = pd.Series(["15/07/2023"])
    times_summer = pd.Series(["12:00"])
    utc_summer = parse_uk_datetime_to_utc(dates_summer, times_summer)
    assert utc_summer.iloc[0].hour == 11, f"Expected 11 UTC for BST noon, got {utc_summer.iloc[0].hour}"

    # Winter (GMT = UTC+0): 12:00 GMT should be 12:00 UTC
    dates_winter = pd.Series(["15/01/2023"])
    times_winter = pd.Series(["12:00"])
    utc_winter = parse_uk_datetime_to_utc(dates_winter, times_winter)
    assert utc_winter.iloc[0].hour == 12, f"Expected 12 UTC for GMT noon, got {utc_winter.iloc[0].hour}"


def test_spatial_join_distance_cap():
    """Verify KD-tree matcher rejects / unmatches points exceeding max_distance_km."""
    target_df = pd.DataFrame({
        "count_point_id": [1],
        "latitude": [51.5000],
        "longitude": [-0.1200],
        "road_category": ["A"],
        "all_motor_vehicles": [25000],
    })
    matcher = FastSpatialMatcher(target_df, lat_col="latitude", lon_col="longitude")

    # Point 1: ~100m away (should match)
    # Point 2: ~10km away (should fail max_distance_km=2.0)
    query_lats = np.array([51.5005, 51.6000])
    query_lons = np.array([-0.1200, -0.1200])

    res = matcher.query_nearest(query_lats, query_lons, max_distance_km=2.0)
    assert res.iloc[0]["is_within_distance_cap"] == True
    assert res.iloc[0]["count_point_id"] == 1
    assert res.iloc[1]["is_within_distance_cap"] == False
    assert np.isnan(res.iloc[1]["spatial_join_distance_km"])


def test_control_sampling_rejection_rule():
    """Verify control sampling strictly rejects candidates within 500m and +/- 1 hour."""
    cases = pd.DataFrame({
        "collision_index": ["C1"],
        "latitude": [51.5000],
        "longitude": [-0.1200],
        "datetime_utc": [pd.Timestamp("2023-06-15 14:00:00", tz="UTC")],
        "speed_limit": [30],
        "road_type": [1],
        "junction_detail": [0],
        "urban_or_rural_area": [1],
    })

    # Sample controls
    controls = sample_controls_for_cases(cases, control_ratio=4, seed=42)
    assert len(controls) == 4
    assert (controls["is_accident"] == 0).all()

    # Verify no control is within 500m AND within 1 hour
    for _, ctrl in controls.iterrows():
        dist_km = haversine_distance_km(
            np.array([51.5000]), np.array([-0.1200]),
            np.array([ctrl["latitude"]]), np.array([ctrl["longitude"]])
        )[0]
        time_diff_hours = abs((ctrl["datetime_utc"] - cases["datetime_utc"].iloc[0]).total_seconds()) / 3600.0

        if dist_km <= 0.5:
            assert time_diff_hours > 1.0, f"Control accepted inside rejection space-time buffer: dist={dist_km*1000}m, dt={time_diff_hours}h"


def test_no_leakage_audit():
    """Verify Task A builder purges subjective post-collision fields."""
    cases = pd.DataFrame({
        "collision_index": ["C1", "C2"],
        "latitude": [51.5000, 51.5100],
        "longitude": [-0.1200, -0.1300],
        "datetime_utc": [pd.Timestamp("2023-01-01 12:00:00", tz="UTC"), pd.Timestamp("2023-01-02 15:00:00", tz="UTC")],
        "speed_limit": [30, 40],
        "road_type": [1, 2],
        "junction_detail": [0, 1],
        "urban_or_rural_area": [1, 2],
        "collision_severity": [1, 3],
        "weather_conditions": [1, 2],
        "light_conditions": [1, 4],
        "road_surface_conditions": [1, 2],
        "number_of_vehicles": [2, 1],
        "number_of_casualties": [1, 1],
    })

    task_a_df, feat_dict = build_task_a_dataset(cases, control_ratio=2, seed=42)

    leaking_fields = [
        "collision_severity", "weather_conditions", "light_conditions",
        "road_surface_conditions", "number_of_vehicles", "number_of_casualties"
    ]
    for field in leaking_fields:
        assert field not in task_a_df.columns, f"Leaking field {field} was found in Task A dataset!"


def test_metric_functions_toy_inputs():
    """Verify metric calculations on known deterministic toy arrays."""
    y_true = np.array([1, 0, 1, 0, 1])
    y_prob = np.array([0.9, 0.1, 0.8, 0.2, 0.7])

    metrics = compute_binary_metrics(y_true, y_prob)
    assert metrics["roc_auc"] == 1.0
    assert metrics["brier_score"] < 0.05

    # Prior correction
    adjusted = apply_prior_correction(np.array([0.5]), sample_case_fraction=0.5, population_case_fraction=0.1)
    assert adjusted[0] < 0.5, "Adjusted probability should decrease when population prior < sample prior"

    # Rank metrics
    imp_a = pd.Series([10.0, 5.0, 1.0], index=["A", "B", "C"])
    imp_b = pd.Series([10.0, 5.0, 1.0], index=["A", "B", "C"])
    rank_m = compute_rank_metrics(imp_a, imp_b)
    assert rank_m["spearman_rho"] == 1.0
    assert rank_m["cosine_similarity"] == pytest.approx(1.0, 1e-5)
