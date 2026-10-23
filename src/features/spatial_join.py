"""Spatial join utilities using scipy.spatial.cKDTree for fast nearest-neighbor matching."""

import math
from typing import Optional, Tuple
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree


def lat_lon_to_cartesian_km(
    lats: np.ndarray, lons: np.ndarray, ref_lat: float = 54.0
) -> np.ndarray:
    """Project lat/lon to local metric Cartesian coordinates (in kilometers).
    
    1 deg latitude ~ 111.195 km
    1 deg longitude ~ 111.195 * cos(ref_lat) km
    """
    scale_y = 111.195
    scale_x = 111.195 * math.cos(math.radians(ref_lat))
    x = lons * scale_x
    y = lats * scale_y
    return np.column_stack([x, y])


class FastSpatialMatcher:
    """KD-tree based spatial matcher with distance thresholding and road class preference."""

    def __init__(
        self,
        target_df: pd.DataFrame,
        lat_col: str = "latitude",
        lon_col: str = "longitude",
        id_col: str = "count_point_id",
        road_class_col: Optional[str] = "road_category",
        ref_lat: float = 54.0,
    ):
        self.ref_lat = ref_lat
        self.target_df = target_df.copy().reset_index(drop=True)
        self.id_col = id_col
        self.road_class_col = road_class_col

        valid_mask = self.target_df[lat_col].notna() & self.target_df[lon_col].notna()
        self.clean_targets = self.target_df[valid_mask].copy().reset_index(drop=True)

        coords_km = lat_lon_to_cartesian_km(
            self.clean_targets[lat_col].values,
            self.clean_targets[lon_col].values,
            ref_lat=self.ref_lat,
        )
        self.tree = cKDTree(coords_km)

    def query_nearest(
        self,
        query_lats: np.ndarray,
        query_lons: np.ndarray,
        max_distance_km: float = 2.0,
        query_road_classes: Optional[np.ndarray] = None,
        k_neighbors: int = 5,
    ) -> pd.DataFrame:
        """Find the nearest count point within max_distance_km, prioritizing road class match if provided."""
        query_coords_km = lat_lon_to_cartesian_km(query_lats, query_lons, ref_lat=self.ref_lat)
        distances, indices = self.tree.query(query_coords_km, k=k_neighbors)

        # Handle 1-D case if k_neighbors == 1
        if k_neighbors == 1:
            distances = distances[:, np.newaxis]
            indices = indices[:, np.newaxis]

        n_queries = len(query_lats)
        best_indices = np.full(n_queries, -1, dtype=int)
        best_distances = np.full(n_queries, np.nan, dtype=float)

        for i in range(n_queries):
            c_dists = distances[i]
            c_inds = indices[i]

            # Filter within max distance cap
            valid_within_cap = c_dists <= max_distance_km
            if not np.any(valid_within_cap):
                continue

            filtered_dists = c_dists[valid_within_cap]
            filtered_inds = c_inds[valid_within_cap]

            if query_road_classes is not None and self.road_class_col in self.clean_targets.columns:
                target_classes = self.clean_targets.iloc[filtered_inds][self.road_class_col].astype(str).values
                q_class = str(query_road_classes[i])
                matches = target_classes == q_class
                if np.any(matches):
                    # Pick closest matching class
                    best_indices[i] = filtered_inds[matches][0]
                    best_distances[i] = filtered_dists[matches][0]
                    continue

            # Fallback: closest within cap
            best_indices[i] = filtered_inds[0]
            best_distances[i] = filtered_dists[0]

        matched_records = []
        for i, idx in enumerate(best_indices):
            if idx >= 0:
                rec = self.clean_targets.iloc[idx].to_dict()
                rec["spatial_join_distance_km"] = best_distances[i]
                rec["is_within_distance_cap"] = True
            else:
                rec = {"spatial_join_distance_km": np.nan, "is_within_distance_cap": False}
            matched_records.append(rec)

        return pd.DataFrame(matched_records)


def haversine_distance_km(
    lat1: np.ndarray, lon1: np.ndarray, lat2: np.ndarray, lon2: np.ndarray
) -> np.ndarray:
    """Exact great-circle distance between coordinate arrays in kilometers."""
    r = 6371.0
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = (
        np.sin(delta_phi / 2.0) ** 2
        + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return r * c


if __name__ == "__main__":
    # Test spatial join
    target_data = pd.DataFrame({
        "count_point_id": [101, 102],
        "latitude": [51.5000, 51.5200],
        "longitude": [-0.1200, -0.1300],
        "road_category": ["A", "B"],
        "all_motor_vehicles": [15000, 8000]
    })
    matcher = FastSpatialMatcher(target_data)
    queries = matcher.query_nearest(
        np.array([51.5010, 52.0000]),
        np.array([-0.1210, -0.1000]),
        max_distance_km=2.0
    )
    print("Spatial match test:")
    print(queries[["count_point_id", "spatial_join_distance_km", "is_within_distance_cap"]])
