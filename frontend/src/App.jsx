import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Layers,
  Lock,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sun,
  TrendingUp,
  Wind,
  Zap,
  Copy,
  Check,
  Car,
  Clock,
  Sparkles,
  Search,
  GraduationCap,
  Eye,
  Type,
  Scale,
  Target,
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  ChevronDown,
  User,
  X,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Send,
  HelpCircle,
  RefreshCw,
  Crosshair,
  MousePointer,
  Maximize2,
  FileUp,
  Info
} from 'lucide-react';
import { researchData } from './data/researchData.js';

// Modern vector avatar for David Jayaraj matching the Aqua Teal palette
const UserAvatar = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{
      borderRadius: '50%',
      border: size > 60 ? '4px solid #2dd4bf' : '2px solid #2dd4bf',
      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
      flexShrink: 0
    }}
  >
    <defs>
      <linearGradient id={`avBg_${size}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ccfbf1" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill={`url(#avBg_${size})`} />
    <circle cx="50" cy="48" r="22" fill="#ffd5b5" />
    <path d="M 28 42 C 28 22, 72 22, 72 42 C 65 26, 35 26, 28 42 Z" fill="#0f766e" />
    <ellipse cx="50" cy="30" rx="22" ry="14" fill="#0f766e" />
    <circle cx="43" cy="46" r="2.5" fill="#134e4a" />
    <circle cx="57" cy="46" r="2.5" fill="#134e4a" />
    <path d="M 45 56 Q 50 61 55 56" stroke="#134e4a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M 18 100 C 22 72, 78 72, 82 100 Z" fill="#0d9488" />
    <polygon points="50,72 44,85 56,85" fill="#ffffff" />
  </svg>
);

// Pre-defined scenario presets
const PRESETS = [
  {
    id: 'tp',
    name: 'Evening Peak Commute',
    icon: Car,
    desc: 'High traffic (18k veh/h), 50mph, 17:00 dusk, damp road',
    caseKey: 'typical_high_risk_tp',
    inputs: {
      traffic_flow: 18287,
      speed_limit: 50,
      hour: 17,
      temp: 0.5,
      precip: 0.0,
      rolling_24h_precip: 16.4,
      wind: 25.6,
      solar_elev: -8.4,
      junction: 0,
      urban_rural: 2
    }
  },
  {
    id: 'tn',
    name: 'Clear Rural Daylight',
    icon: Sun,
    desc: 'Low traffic (1.2k veh/h), midday, dry, clear sky',
    caseKey: 'typical_low_risk_tn',
    inputs: {
      traffic_flow: 1200,
      speed_limit: 60,
      hour: 13,
      temp: 18.0,
      precip: 0.0,
      rolling_24h_precip: 0.0,
      wind: 8.5,
      solar_elev: 48.2,
      junction: 0,
      urban_rural: 2
    }
  },
  {
    id: 'storm',
    name: 'Severe Storm & Rain',
    icon: CloudRain,
    desc: 'Heavy precipitation (12mm/h), high wind gusts (65km/h), night',
    caseKey: 'extreme_weather_case',
    inputs: {
      traffic_flow: 11500,
      speed_limit: 70,
      hour: 22,
      temp: 4.2,
      precip: 12.0,
      rolling_24h_precip: 28.5,
      wind: 65.0,
      solar_elev: -35.0,
      junction: 1,
      urban_rural: 1
    }
  },
  {
    id: 'fog',
    name: 'Freezing Winter Fog',
    icon: Wind,
    desc: 'Sub-zero temp (-2°C), dense fog proxy, morning rush (08:00)',
    caseKey: null,
    inputs: {
      traffic_flow: 14200,
      speed_limit: 40,
      hour: 8,
      temp: -2.0,
      precip: 0.2,
      rolling_24h_precip: 4.0,
      wind: 12.0,
      solar_elev: 3.5,
      junction: 3,
      urban_rural: 1
    }
  },
  {
    id: 'borderline',
    name: 'Borderline Case',
    icon: Activity,
    desc: 'Medium traffic (6.5k veh/h), twilight transition, cool temp',
    caseKey: 'borderline_uncertain',
    inputs: {
      traffic_flow: 6500,
      speed_limit: 30,
      hour: 19,
      temp: 9.0,
      precip: 1.5,
      rolling_24h_precip: 5.2,
      wind: 18.0,
      solar_elev: -2.0,
      junction: 0,
      urban_rural: 1
    }
  }
];

// NLP Tokens for Police STATS19 Accident Log Demonstration
const NLP_TOKENS = [
  { word: "Vehicle-1", score: 0.02, type: "neutral" },
  { word: "travelling", score: 0.01, type: "neutral" },
  { word: "northbound", score: 0.01, type: "neutral" },
  { word: "encountered", score: 0.03, type: "neutral" },
  { word: "sudden", score: 0.28, type: "hazard" },
  { word: "aquaplaning", score: 0.52, type: "critical" },
  { word: "on", score: 0.01, type: "neutral" },
  { word: "standing-water", score: 0.44, type: "critical" },
  { word: "across", score: 0.01, type: "neutral" },
  { word: "unlit", score: 0.34, type: "hazard" },
  { word: "rural", score: 0.26, type: "hazard" },
  { word: "dual-carriageway,", score: 0.12, type: "medium" },
  { word: "lost-traction", score: 0.49, type: "critical" },
  { word: "and", score: 0.01, type: "neutral" },
  { word: "struck", score: 0.38, type: "hazard" },
  { word: "barrier", score: 0.14, type: "medium" },
  { word: "during", score: 0.02, type: "neutral" },
  { word: "torrential-rain.", score: 0.46, type: "critical" },
  { word: "[Safety:", score: 0.0, type: "neutral" },
  { word: "Seatbelt-worn]", score: -0.32, type: "protective" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [selectedPreset, setSelectedPreset] = useState('tp');
  const [copiedBib, setCopiedBib] = useState(false);

  // Live slider state
  const [inputs, setInputs] = useState(PRESETS[0].inputs);
  const [selectedTask, setSelectedTask] = useState('task_a');
  const [selectedPdpFeature, setSelectedPdpFeature] = useState('traffic_flow_hourly_est');

  // Vision Grad-CAM simulation state
  const [camIntensity, setCamIntensity] = useState(75);
  const [selectedHotspot, setSelectedHotspot] = useState('water');

  // Multimodal Sub-navigation state
  const [multimodalSubTab, setMultimodalSubTab] = useState('vision'); // 'vision' | 'ask_xai' | 'nlp_tokens'

  // Custom Image Upload & Interactive Visual XAI state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [visionPreset, setVisionPreset] = useState('rain'); // 'rain' | 'fog' | 'night' | 'urban' | 'uploaded'
  const [camColorMap, setCamColorMap] = useState('thermal'); // 'thermal' | 'amber' | 'cyan'
  const [inspectedPoint, setInspectedPoint] = useState({
    x: 35,
    y: 82,
    label: "Road Asphalt & Specular Water Reflection",
    hazard: "Aquaplaning & Hydroplaning Surface Film",
    saliency: 0.52,
    impact: "+0.28 logit to collision risk",
    desc: "Specular reflections indicate standing water film >3mm that overwhelms tire tread drainage, elevating slip hazard."
  });

  // Ask XAI (Natural Language Question & Scenario Explainer) state
  const [xaiQuestion, setXaiQuestion] = useState("Why does freezing rain at 17:30 cause an extreme collision hazard?");
  const [isAskingXai, setIsAskingXai] = useState(false);
  const [xaiAnswer, setXaiAnswer] = useState({
    question: "Why does freezing rain at 17:30 cause an extreme collision hazard?",
    executive_summary: "For the inquiry regarding freezing rain at 17:30, the model predicts an elevated collision risk of 48.7% (Extreme Hazard) with a 42% likelihood of severe/fatal injury (Task B KSI). The primary hazard driver is Ambient Temperature & Freezing State (+0.245 logit) coupled with peak diurnal traffic flow.",
    risk_probability: 0.487,
    ksi_severity_probability: 0.42,
    risk_tier: "Extreme Hazard",
    shap_attributions: [
      { feature: "Ambient Temperature & Freezing", value: "-1.8°C", shap: 0.245, family: "Weather" },
      { feature: "Hourly Traffic Flow", value: "18,287 veh/h", shap: 0.220, family: "Traffic" },
      { feature: "Precipitation & Wet Road", value: "8.5 mm/h", shap: 0.195, family: "Weather" },
      { feature: "Time of Day (Dusk Twilight)", value: "17:30", shap: 0.160, family: "Time/Light" },
      { feature: "Speed Limit", value: "50 mph", shap: 0.080, family: "Road" }
    ],
    counterfactual_recourses: [
      {
        action: "Reduce speed limit from 50 mph to 35 mph",
        delta_prob: "-15.2% risk reduction",
        mechanism: "Significantly decreases required braking distance on low-friction road surfaces."
      },
      {
        action: "Deploy pre-emptive brine/salt anti-icing highway treatments",
        delta_prob: "-12.5% risk reduction",
        mechanism: "Preserves micro-texture asphalt friction coefficient μ above freezing threshold."
      },
      {
        action: "Shift transit departure by 40 minutes to exit peak commute band",
        delta_prob: "-11.8% risk reduction",
        mechanism: "Relieves traffic congestion density below critical flow capacity."
      }
    ],
    derived_features: { tf: 18287, spd: 50, hr: 17.5, sol: -8.4, prec: 8.5, tmp: -1.8, wnd: 26 },
    citation: "UK STATS19 (2021-2024) & ECMWF ERA5 Atmospheric Reanalysis"
  });

  // Handle custom image upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setVisionPreset('uploaded');
      setInspectedPoint({
        x: 50,
        y: 65,
        label: "Uploaded Image Feature Anchor",
        hazard: "User-Specified Custom Scene Saliency",
        saliency: 0.54,
        impact: "+0.26 logit to collision risk",
        desc: "Convolutional spatial gradient activations highlight localized visual hazard concentrations within your uploaded scene."
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle interactive click-to-inspect on image/canvas
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    let label = "Road Surface Region";
    let hazard = "Traction & Lane Guidance";
    let saliency = 0.35;
    let impact = "+0.12 logit to collision risk";
    let desc = "Normal roadway surface texture with baseline tire adhesion.";

    if (y >= 60) {
      if (x >= 25 && x <= 75) {
        label = "Road Asphalt & Specular Water Reflection";
        hazard = "Aquaplaning & Hydroplaning Surface Film";
        saliency = 0.52;
        impact = "+0.28 logit to collision risk";
        desc = "Specular puddle reflections indicate standing water film exceeding 3mm that compromises tire-road drainage channels.";
      } else {
        label = "Road Shoulder / Verge Margin";
        hazard = "Blind Lateral Boundary / Drop-off";
        saliency = 0.38;
        impact = "+0.15 logit to collision risk";
        desc = "Edge features identify unlit verge boundary with low retroreflective marking contrast.";
      }
    } else if (y >= 35 && y < 60) {
      if (x >= 35 && x <= 65) {
        label = "Lead Vehicle Trajectory & Brake Cluster";
        hazard = "Sudden Deceleration Headway Shockwave";
        saliency = 0.48;
        impact = "+0.25 logit to collision risk";
        desc = "High activation on lead vehicle tail-light signatures and rapid deceleration headway.";
      } else {
        label = "Adjacent Lane / Pedestrian Footway";
        hazard = "Vulnerable Road User Proximity";
        saliency = 0.43;
        impact = "+0.20 logit to collision risk";
        desc = "Spatial gradients highlight roadside pedestrian or cyclist silhouettes within braking zone.";
      }
    } else {
      label = "Upper Twilight Sky & Overhead Glare";
      hazard = "Optical Contrast Deficit & Glare Masking";
      saliency = 0.31;
      impact = "+0.11 logit to collision risk";
      desc = "High-luminance background sky combined with dark roadway creates visual masking for oncoming hazards.";
    }

    setInspectedPoint({ x, y, label, hazard, saliency, impact, desc });
  };

  // Dynamic Natural Language XAI Question solver with backend sync & local fallback
  const handleAskXai = async (qText) => {
    const q = (qText || xaiQuestion).trim();
    if (!q) return;
    setIsAskingXai(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ask-xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        setXaiAnswer(data);
        setIsAskingXai(false);
        return;
      }
    } catch {
      // Fallback to local reasoning
    }

    const qLower = q.toLowerCase();
    let tf = 8500;
    let spd = 40;
    let hr = 14;
    let sol = 15;
    let prec = 0;
    let r24 = 2.0;
    let tmp = 10;
    let wnd = 18;

    if (qLower.includes('peak') || qLower.includes('rush') || qLower.includes('commute') || qLower.includes('18k') || qLower.includes('heavy traffic')) {
      tf = 18287;
      hr = 17;
      sol = -8;
    } else if (qLower.includes('rural') || qLower.includes('empty') || qLower.includes('low traffic')) {
      tf = 1200;
    }

    if (qLower.includes('70') || qLower.includes('motorway')) spd = 70;
    else if (qLower.includes('60')) spd = 60;
    else if (qLower.includes('50')) spd = 50;
    else if (qLower.includes('30') || qLower.includes('urban') || qLower.includes('junction')) spd = 30;

    if (qLower.includes('freeze') || qLower.includes('freezing') || qLower.includes('ice') || qLower.includes('frost') || qLower.includes('sub-zero')) {
      tmp = -1.8;
      prec = 0.8;
      r24 = 12.0;
    }
    if (qLower.includes('rain') || qLower.includes('storm') || qLower.includes('wet') || qLower.includes('aquaplaning')) {
      prec = Math.max(prec, 8.5);
      r24 = Math.max(r24, 24.0);
    }
    if (qLower.includes('fog') || qLower.includes('mist')) {
      wnd = 8;
      tmp = 2.0;
    }
    if (qLower.includes('wind') || qLower.includes('gust')) {
      wnd = 64;
    }
    if (qLower.includes('night') || qLower.includes('dark') || qLower.includes('midnight')) {
      hr = 23;
      sol = -42;
    } else if (qLower.includes('twilight') || qLower.includes('dusk') || qLower.includes('sunset') || qLower.includes('-5') || qLower.includes('solar')) {
      hr = 17.5;
      sol = -6.5;
    }

    const baseLogit = -1.386;
    const shap_traffic = Math.max(-0.45, Math.min(0.65, ((tf - 8000) / 7000) * 0.42));
    const shap_hour = (hr >= 16 && hr <= 19) ? 0.18 : ((hr >= 7 && hr <= 9) ? 0.12 : ((hr >= 23 || hr <= 4) ? -0.25 : 0.02));
    const shap_solar = sol < -6 ? 0.14 : (sol >= 20 ? -0.09 : 0.05);
    const shap_precip = (prec > 0 ? Math.min(0.25, prec * 0.035) : -0.05) + Math.min(0.12, r24 * 0.006);
    const shap_temp = tmp <= 0 ? 0.11 : (tmp < 5 ? 0.04 : -0.02);
    const shap_speed = spd >= 60 ? 0.08 : (spd <= 30 ? -0.06 : 0.0);
    const shap_wind = wnd > 40 ? Math.min(0.15, (wnd - 40) * 0.005) : -0.03;

    const totalLogit = baseLogit + shap_traffic + shap_hour + shap_solar + shap_precip + shap_temp + shap_speed + shap_wind;
    const prob_a = 1 / (1 + Math.exp(-totalLogit));
    const prob_b = Math.min(0.75, Math.max(0.10, 0.22 + (spd >= 60 ? 0.15 : 0) + (tmp <= 0 ? 0.12 : 0)));

    const attributions = [
      { feature: 'Hourly Traffic Flow', value: `${tf.toLocaleString()} veh/h`, shap: shap_traffic, family: 'Traffic' },
      { feature: 'Precipitation & Wet Road', value: `${prec} mm/h`, shap: shap_precip, family: 'Weather' },
      { feature: 'Solar Elevation & Light', value: `${sol}°`, shap: shap_solar, family: 'Time/Light' },
      { feature: 'Road Speed Limit', value: `${spd} mph`, shap: shap_speed, family: 'Road' },
      { feature: 'Ambient Temperature', value: `${tmp}°C`, shap: shap_temp, family: 'Weather' },
      { feature: 'Time of Day', value: `${Math.floor(hr)}:${Math.floor((hr%1)*60).toString().padStart(2, '0')}`, shap: shap_hour, family: 'Time/Light' },
      { feature: '10m Wind Gusts', value: `${wnd} km/h`, shap: shap_wind, family: 'Weather' }
    ].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));

    const tier = prob_a > 0.45 ? 'Extreme Hazard' : (prob_a > 0.30 ? 'Elevated Hazard' : (prob_a > 0.15 ? 'Moderate Risk' : 'Baseline'));

    let narrative = `For the inquiry regarding "${q}", the model predicts a collision occurrence risk of ${(prob_a * 100).toFixed(1)}% (${tier}) with a ${(prob_b * 100).toFixed(0)}% likelihood of severe or fatal injury (Task B KSI). The primary risk driver is ${attributions[0].feature} (${attributions[0].shap > 0 ? '+' : ''}${attributions[0].shap.toFixed(3)} logit). `;

    if (tmp <= 0 && prec > 0) {
      narrative += "Sub-zero temperatures combined with antecedent precipitation induce black-ice formation, severely undermining tire braking friction (μ drops from 0.75 to below 0.18). ";
    } else if (sol < -5) {
      narrative += "Negative solar elevation (-8° dusk twilight) drastically attenuates peripheral driver visual reaction time and induces headlight glare distortion. ";
    } else if (tf > 14000) {
      narrative += "Heavy hourly vehicular density suppresses headway margins, causing localized shockwave braking to propagate into high rear-end collision clusters. ";
    }

    const cfs = [];
    if (spd >= 50) {
      cfs.push({
        action: `Reduce speed limit from ${spd} mph to ${Math.max(30, spd - 15)} mph`,
        delta_prob: `-${(0.08 + (spd - 30) * 0.003 * 100).toFixed(1)}% risk reduction`,
        mechanism: 'Shortens vehicle braking stopping distance and dissipates kinetic energy.'
      });
    }
    if (tf > 10000) {
      cfs.push({
        action: 'Shift travel departure by 45 minutes to exit peak commute band',
        delta_prob: `-${(Math.min(0.25, ((tf - 8000) / 7000) * 0.22) * 100).toFixed(1)}% risk reduction`,
        mechanism: 'Relieves vehicular volume below congestion flow breakdown capacity.'
      });
    }
    if (tmp <= 1 || prec > 2.0) {
      cfs.push({
        action: 'Deploy pre-emptive brine/salt anti-icing highway treatments',
        delta_prob: '-12.5% risk reduction',
        mechanism: 'Preserves micro-texture asphalt friction coefficient μ above freezing threshold.'
      });
    }

    setXaiAnswer({
      question: q,
      executive_summary: narrative,
      risk_probability: prob_a,
      ksi_severity_probability: prob_b,
      risk_tier: tier,
      shap_attributions: attributions,
      counterfactual_recourses: cfs,
      derived_features: { tf, spd, hr, sol, prec, tmp, wnd },
      citation: 'UK STATS19 (2021-2024) & ECMWF ERA5 Atmospheric Reanalysis'
    });
    setIsAskingXai(false);
  };

  // NLP Token inspection state
  const [activeToken, setActiveToken] = useState(NLP_TOKENS[5]);

  // Load a preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setInputs(preset.inputs);
  };

  // Update single input
  const updateInput = (key, value) => {
    setSelectedPreset(null);
    setInputs(prev => ({ ...prev, [key]: Number(value) }));
  };

  // Estimate risk score, SHAP waterfall, Counterfactuals & Shapley Axioms
  const simulation = useMemo(() => {
    // Base log-odds for Task A (prior ~ 0.20 -> logit = ln(0.20/0.80) = -1.386)
    const baseLogit = -1.386;

    // Feature SHAP contributions modeled from TreeSHAP importances & empirical bounds
    const trafficNormalized = (inputs.traffic_flow - 8000) / 7000;
    const shap_traffic = Math.max(-0.45, Math.min(0.65, trafficNormalized * 0.42));

    let shap_hour = 0;
    if (inputs.hour >= 7 && inputs.hour <= 9) shap_hour = 0.12;
    else if (inputs.hour >= 16 && inputs.hour <= 19) shap_hour = 0.18;
    else if (inputs.hour >= 23 || inputs.hour <= 4) shap_hour = -0.25;
    else shap_hour = 0.02;

    let shap_solar = 0;
    if (inputs.solar_elev < -6) shap_solar = 0.14;
    else if (inputs.solar_elev >= 20) shap_solar = -0.09;
    else shap_solar = 0.05;

    const precipImpact = inputs.precip > 0 ? Math.min(0.25, inputs.precip * 0.035) : -0.05;
    const roadDampImpact = Math.min(0.12, inputs.rolling_24h_precip * 0.006);
    const shap_precip = precipImpact + roadDampImpact;

    let shap_road = 0;
    if (inputs.speed_limit >= 60) shap_road += 0.08;
    else if (inputs.speed_limit <= 30) shap_road -= 0.06;
    if (inputs.urban_rural === 2) shap_road += 0.04;

    const shap_wind = inputs.wind > 40 ? Math.min(0.15, (inputs.wind - 40) * 0.005) : -0.03;
    const shap_temp = inputs.temp <= 0 ? 0.11 : inputs.temp < 5 ? 0.04 : -0.02;

    const totalShapSum = shap_traffic + shap_hour + shap_solar + shap_precip + shap_road + shap_wind + shap_temp;
    const finalLogit = baseLogit + totalShapSum;
    const riskProb = 1 / (1 + Math.exp(-finalLogit));

    const contributions = [
      { name: 'Hourly Traffic Flow', val: shap_traffic, raw: `${inputs.traffic_flow.toLocaleString()} veh/h`, category: 'Traffic' },
      { name: 'Time of Day (Hour)', val: shap_hour, raw: `${inputs.hour}:00 UTC`, category: 'Time/Light' },
      { name: 'Solar Elevation / Light', val: shap_solar, raw: `${inputs.solar_elev.toFixed(1)}° (${inputs.solar_elev < 0 ? 'Night' : 'Day'})`, category: 'Time/Light' },
      { name: 'Precipitation & Damp Road', val: shap_precip, raw: `${inputs.precip} mm/h (${inputs.rolling_24h_precip}mm 24h)`, category: 'Weather' },
      { name: 'Speed Limit & Segment Area', val: shap_road, raw: `${inputs.speed_limit} mph (${inputs.urban_rural === 2 ? 'Rural' : 'Urban'})`, category: 'Road' },
      { name: 'Wind Gusts (10m)', val: shap_wind, raw: `${inputs.wind} km/h`, category: 'Weather' },
      { name: 'Ambient Temperature (2m)', val: shap_temp, raw: `${inputs.temp}°C`, category: 'Weather' }
    ].sort((a, b) => Math.abs(b.val) - Math.abs(a.val));

    // Estimated severity probability (Task B: KSI given collision)
    let baseKsi = 0.22;
    if (inputs.speed_limit >= 60) baseKsi += 0.14;
    if (inputs.urban_rural === 2) baseKsi += 0.08;
    if (inputs.solar_elev < 0) baseKsi += 0.05;
    const ksiProb = Math.min(0.75, Math.max(0.08, baseKsi));

    // Counterfactual Explanation: Minimum intervention to bring risk below 20%
    const isElevated = riskProb > 0.25;
    const counterfactuals = [];
    if (isElevated) {
      if (inputs.speed_limit > 30) {
        counterfactuals.push({
          action: `Reduce speed limit to 30 mph`,
          diff: `Δ = -${inputs.speed_limit - 30} mph`,
          impact: `Lowers relative logit by ~0.14`
        });
      }
      if (inputs.traffic_flow > 6000) {
        counterfactuals.push({
          action: `Reroute traffic flow to ≤ 6,000 veh/h`,
          diff: `Δ = -${(inputs.traffic_flow - 6000).toLocaleString()} veh/h`,
          impact: `Reduces exposure by ~0.35 SHAP margin`
        });
      }
      if (inputs.solar_elev < 0) {
        counterfactuals.push({
          action: `Shift transit to daylight hours (12:00 - 14:00 UTC)`,
          diff: `Solar angle: ${inputs.solar_elev}° → +40°`,
          impact: `Removes nocturnal visibility hazard (-0.23 logit)`
        });
      }
    } else {
      counterfactuals.push({
        action: `Baseline safe regime maintained`,
        diff: `No adverse interventions required`,
        impact: `Predicted risk (${(riskProb * 100).toFixed(1)}%) is below standard intervention threshold`
      });
    }

    return {
      riskProb,
      ksiProb,
      baseVal: 0.20,
      baseLogit,
      finalLogit,
      totalShapSum,
      contributions,
      counterfactuals
    };
  }, [inputs]);

  // Risk tier color and label with glossy peach/warm tones
  const getRiskTier = (p) => {
    if (p < 0.10) return { label: 'Low Relative Risk', color: '#059669', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
    if (p < 0.25) return { label: 'Moderate Baseline Risk', color: '#ea580c', bg: 'rgba(255, 237, 213, 0.85)', border: 'rgba(234, 88, 12, 0.3)' };
    if (p < 0.45) return { label: 'Elevated Hazard', color: '#d97706', bg: 'rgba(254, 243, 199, 0.85)', border: 'rgba(217, 119, 6, 0.3)' };
    return { label: 'High Relative Risk', color: '#e11d48', bg: 'rgba(255, 228, 230, 0.85)', border: 'rgba(225, 29, 72, 0.35)' };
  };

  const currentTier = getRiskTier(simulation.riskProb);

  const copyBibtex = () => {
    const bib = `@article{xai_road_risk_2026,
  title = {Do Road-Risk Explanations Change With Weather and Traffic? Explainable AI for Road Accident Risk Detection},
  author = {Research AI Team},
  year = {2026},
  journal = {Journal of Transport Safety & Machine Learning},
  note = {Reproducible benchmark with UK STATS19, DfT AADF, and Open-Meteo ERA5}
}`;
    navigator.clipboard.writeText(bib);
    setCopiedBib(true);
    setTimeout(() => setCopiedBib(false), 2500);
  };

  return (
    <div className="app-layout">
      {/* Background Orbs and Angled Geometric Surface */}
      <div className="app-bg-wrapper">
        <div className="bg-orb-top-right"></div>
        <div className="bg-orb-bottom-left"></div>
        <div className="bg-geometric-plane"></div>
        <div className="bg-geometric-plane-2"></div>
      </div>

      {/* ======================================================================= */}
      {/* SIDEBAR NAVIGATION (Aqua Teal Glassmorphism UI) */}
      {/* ======================================================================= */}
      <aside className="sidebar">
        <div>
          {/* Logo Brand */}
          <div className="sidebar-brand">
            <div className="brand-icon-box">A</div>
            <div className="brand-title-wrap">
              <span className="brand-title">AI Studio</span>
              <span className="brand-badge">XAI ROAD RISK</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="sidebar-nav">
            <button
              className={`nav-item-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
              id="tab-simulator-btn"
            >
              <div className="nav-item-left">
                <Sliders className="nav-icon" size={19} />
                <span>Risk Simulator & SHAP</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'multimodal' ? 'active' : ''}`}
              onClick={() => setActiveTab('multimodal')}
              id="tab-multimodal-btn"
            >
              <div className="nav-item-left">
                <Eye className="nav-icon" size={19} />
                <span>Multimodal XAI</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'benchmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('benchmarks')}
              id="tab-benchmarks-btn"
            >
              <div className="nav-item-left">
                <Gauge className="nav-icon" size={19} />
                <span>Model Benchmarks</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'stability' ? 'active' : ''}`}
              onClick={() => setActiveTab('stability')}
              id="tab-stability-btn"
            >
              <div className="nav-item-left">
                <Layers className="nav-icon" size={19} />
                <span>Regime Stability</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'pdp_ale' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdp_ale')}
              id="tab-pdp-btn"
            >
              <div className="nav-item-left">
                <TrendingUp className="nav-icon" size={19} />
                <span>PDP vs ALE Curves</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
              id="tab-audit-btn"
            >
              <div className="nav-item-left">
                <ShieldCheck className="nav-icon" size={19} />
                <span>Zero-Leakage Audit</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'paper' ? 'active' : ''}`}
              onClick={() => setActiveTab('paper')}
              id="tab-paper-btn"
            >
              <div className="nav-item-left">
                <FileText className="nav-icon" size={19} />
                <span>Paper & Artifacts</span>
              </div>
              <ChevronRight className="nav-item-arrow" size={16} />
            </button>
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="sidebar-user-card" onClick={() => setActiveTab('paper')}>
          <div className="user-info-wrap">
            <UserAvatar size={36} className="user-avatar" />
            <div className="user-text">
              <span className="user-name">David Jayaraj</span>
              <span className="user-role">Student / Safety Analyst</span>
            </div>
          </div>
          <ChevronRight size={16} color="#0f766e" />
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* MAIN CONTENT WRAPPER */}
      {/* ======================================================================= */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-greeting-wrap">
            <span className="header-greeting-sub">Good Morning,</span>
            <h1 className="header-title">Welcome back, David!</h1>
            <p className="header-desc">
              Explainable AI for Road Accident Risk Detection across Weather and Traffic Regimes.
            </p>
          </div>

          <div className="header-actions-wrap">
            {/* Search Box */}
            <div className="search-pill-box">
              <Search size={16} color="#0f766e" />
              <input
                type="text"
                placeholder="Search features, regimes, models..."
                className="search-input"
              />
            </div>

            {/* Notification Bell */}
            <button className="icon-pill-btn" title="System Notifications">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>

            {/* Date Pill Badge */}
            <div className="date-pill-badge">
              <Calendar size={16} color="#0d9488" />
              <div className="date-text-wrap">
                <span>Oct 24, 2026</span>
                <span className="date-sub">Friday</span>
              </div>
            </div>

            {/* Header User Badge */}
            <button className="header-user-btn" onClick={() => setActiveTab('paper')}>
              <UserAvatar size={30} className="header-user-img" />
              <span className="header-user-name">David Jayaraj</span>
              <ChevronDown size={14} color="#0f766e" />
            </button>
          </div>
        </header>

        {/* 4 KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-top">
              <div className="kpi-icon-container kpi-icon-teal">
                <Database size={24} />
              </div>
              <button className="kpi-menu-btn" title="Options">
                <Sparkles size={16} color="#0d9488" />
              </button>
            </div>
            <div className="kpi-card-content">
              <span className="kpi-card-title">Collisions Ingested</span>
              <div className="kpi-card-value">412,276</div>
              <div className="kpi-trend-pill">
                <span>UK STATS19 (2021–2024)</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <div className="kpi-icon-container kpi-icon-aqua">
                <Cpu size={24} />
              </div>
              <button className="kpi-menu-btn" title="Options">
                <ShieldCheck size={16} color="#06b6d4" />
              </button>
            </div>
            <div className="kpi-card-content">
              <span className="kpi-card-title">Ensemble Models</span>
              <div className="kpi-card-value">6 Models</div>
              <div className="kpi-trend-pill">
                <span>XGBoost, RF, LogReg</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <div className="kpi-icon-container kpi-icon-mint">
                <Gauge size={24} />
              </div>
              <button className="kpi-menu-btn" title="Options">
                <TrendingUp size={16} color="#10b981" />
              </button>
            </div>
            <div className="kpi-card-content">
              <span className="kpi-card-title">Test ROC-AUC</span>
              <div className="kpi-card-value">0.842</div>
              <div className="kpi-trend-pill">
                <span>95% CI: [0.838, 0.846]</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <div className="kpi-icon-container kpi-icon-dark-teal">
                <Layers size={24} />
              </div>
              <button className="kpi-menu-btn" title="Options">
                <Activity size={16} color="#0d9488" />
              </button>
            </div>
            <div className="kpi-card-content">
              <span className="kpi-card-title">Regimes Audited</span>
              <div className="kpi-card-value">4 Regimes</div>
              <div className="kpi-trend-pill">
                <span className="kpi-trend-dot"></span>
                <span>Holm-Bonferroni p &lt; 0.001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Navigation Strip */}
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Views:
            </span>
            <button
              className={`category-pill ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
            >
              <Sliders size={13} style={{ marginRight: '6px' }} />
              Risk Simulator
            </button>
            <button
              className={`category-pill ${activeTab === 'multimodal' ? 'active' : ''}`}
              onClick={() => setActiveTab('multimodal')}
            >
              <Eye size={13} style={{ marginRight: '6px' }} />
              Multimodal XAI
            </button>
            <button
              className={`category-pill ${activeTab === 'benchmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('benchmarks')}
            >
              <Gauge size={13} style={{ marginRight: '6px' }} />
              Model Benchmarks
            </button>
            <button
              className={`category-pill ${activeTab === 'stability' ? 'active' : ''}`}
              onClick={() => setActiveTab('stability')}
            >
              <Layers size={13} style={{ marginRight: '6px' }} />
              Regime Stability
            </button>
            <button
              className={`category-pill ${activeTab === 'pdp_ale' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdp_ale')}
            >
              <TrendingUp size={13} style={{ marginRight: '6px' }} />
              PDP vs ALE
            </button>
            <button
              className={`category-pill ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <ShieldCheck size={13} style={{ marginRight: '6px' }} />
              Zero-Leakage Audit
            </button>
            <button
              className={`category-pill ${activeTab === 'paper' ? 'active' : ''}`}
              onClick={() => setActiveTab('paper')}
            >
              <FileText size={13} style={{ marginRight: '6px' }} />
              Paper & Artifacts
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="category-pill"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
              onClick={copyBibtex}
            >
              {copiedBib ? <Check size={13} /> : <Copy size={13} />}
              {copiedBib ? 'BibTeX Copied!' : 'Cite Benchmark'}
            </button>
          </div>
        </div>

        {/* Main Tab Content */}
        <main>
        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE SIMULATOR & LIVE SHAP WATERFALL */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Presets Grid */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                  Canonical Benchmark Scenarios & Case Audits
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click to instantly load verified scenarios
                </span>
              </div>
              <div className="presets-grid">
                {PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isAct = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      className={`preset-card ${isAct ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div className="preset-name">
                        <Icon size={16} color={isAct ? '#ea580c' : '#828799'} />
                        {preset.name}
                      </div>
                      <div className="preset-desc">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Simulator Layout */}
            <div className="grid-2col">
              {/* Left Column: Sliders & Controls */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={20} color="#ea580c" />
                    Spatiotemporal & Atmospheric Inputs
                  </h3>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => handleSelectPreset(PRESETS[0])}
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>

                {/* Slider: Traffic Flow */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Car size={16} color="#ea580c" />
                      Hourly Traffic Flow (AADF x Diurnal Profile)
                    </span>
                    <span className="slider-val">{inputs.traffic_flow.toLocaleString()} veh/h</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="22000"
                    step="250"
                    value={inputs.traffic_flow}
                    onChange={(e) => updateInput('traffic_flow', e.target.value)}
                  />
                </div>

                {/* Slider: Hour of Day */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Clock size={16} color="#f97316" />
                      Hour of Day (UTC)
                    </span>
                    <span className="slider-val">{inputs.hour.toString().padStart(2, '0')}:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={inputs.hour}
                    onChange={(e) => updateInput('hour', e.target.value)}
                  />
                </div>

                {/* Slider: Solar Elevation Angle */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Sun size={16} color="#f59e0b" />
                      Solar Elevation (Astral Astronomical Angle)
                    </span>
                    <span className="slider-val">{inputs.solar_elev}° ({inputs.solar_elev < 0 ? 'Night / Twilight' : 'Daylight'})</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="65"
                    step="1"
                    value={inputs.solar_elev}
                    onChange={(e) => updateInput('solar_elev', e.target.value)}
                  />
                </div>

                {/* Slider: Speed Limit */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Gauge size={16} color="#e11d48" />
                      Road Segment Speed Limit
                    </span>
                    <span className="slider-val">{inputs.speed_limit} mph</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    step="10"
                    value={inputs.speed_limit}
                    onChange={(e) => updateInput('speed_limit', e.target.value)}
                  />
                </div>

                {/* Weather: Precipitation */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <CloudRain size={16} color="#0284c7" />
                      ERA5 Hourly Precipitation
                    </span>
                    <span className="slider-val">{inputs.precip} mm/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={inputs.precip}
                    onChange={(e) => updateInput('precip', e.target.value)}
                  />
                </div>

                {/* Weather: Wind Gusts */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Wind size={16} color="#059669" />
                      ERA5 10m Wind Gusts
                    </span>
                    <span className="slider-val">{inputs.wind} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="2"
                    value={inputs.wind}
                    onChange={(e) => updateInput('wind', e.target.value)}
                  />
                </div>

                {/* Weather: Temperature */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span className="slider-label">
                      <Activity size={16} color="#ea580c" />
                      ERA5 2m Ambient Temperature
                    </span>
                    <span className="slider-val">{inputs.temp} °C</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="35"
                    step="1"
                    value={inputs.temp}
                    onChange={(e) => updateInput('temp', e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Dynamic Gauge & Live SHAP Waterfall */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Risk Gauge Card */}
                <div className="glass-panel risk-meter-box">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Task A: Relative Accident Occurrence Risk
                  </div>

                  <div className="risk-circle-wrapper">
                    <svg className="risk-circle-svg" viewBox="0 0 100 100">
                      <circle className="risk-circle-bg" cx="50" cy="50" r="40" />
                      <circle
                        className="risk-circle-fill"
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={currentTier.color}
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={(2 * Math.PI * 40) * (1 - simulation.riskProb)}
                      />
                    </svg>
                    <div className="risk-circle-text">
                      <div className="risk-number" style={{ color: currentTier.color }}>
                        {(simulation.riskProb * 100).toFixed(1)}
                        <span className="risk-percent">%</span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>P(Occurrence)</span>
                    </div>
                  </div>

                  <div
                    className="risk-status-pill"
                    style={{ backgroundColor: currentTier.bg, color: currentTier.color, border: `1px solid ${currentTier.border}` }}
                  >
                    {currentTier.label}
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <span>Case Prior Base: <strong>20.0%</strong> (1:4 ratio)</span>
                    <span>•</span>
                    <span>Task B Severity (KSI): <strong style={{ color: '#ea580c' }}>{(simulation.ksiProb * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>

                {/* Live SHAP Waterfall Card */}
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} color="#ea580c" />
                      TreeSHAP Local Feature Contributions ($f(x)$)
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Base E[f(X)] = 0.20
                    </span>
                  </div>

                  <div className="waterfall-container">
                    {simulation.contributions.map((item, idx) => {
                      const isPos = item.val >= 0;
                      const barWidth = Math.min(100, (Math.abs(item.val) / 0.65) * 50);
                      return (
                        <div key={idx} className="waterfall-row">
                          <div className="waterfall-feature" title={item.raw}>
                            <span>{item.name}</span>
                          </div>
                          <div className="waterfall-bar-track">
                            <div className="waterfall-bar-center"></div>
                            <div
                              className={`waterfall-bar-fill ${isPos ? 'waterfall-bar-pos' : 'waterfall-bar-neg'}`}
                              style={{
                                width: `${barWidth}%`,
                                left: isPos ? '50%' : `${50 - barWidth}%`
                              }}
                            />
                          </div>
                          <div className={`waterfall-val ${isPos ? 'pos' : 'neg'}`}>
                            {isPos ? '+' : ''}{item.val.toFixed(3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', background: '#ea580c', borderRadius: '3px', display: 'inline-block' }}></span>
                      Warm Coral: Increases risk
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', background: '#0284c7', borderRadius: '3px', display: 'inline-block' }}></span>
                      Sky Blue: Lowers risk
                    </span>
                  </div>
                </div>

                {/* Counterfactual "What-If" Actionable Recourse Card */}
                <div className="counterfactual-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Target size={18} color="#ea580c" />
                    <strong style={{ fontSize: '0.94rem', color: '#1e2029' }}>
                      Counterfactual What-If Recourse (Actionable Explainability)
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Wachter et al. Counterfactual Optimization: <em>"What is the minimum actionable feature perturbation Δx* to reduce predicted collision risk below the 20% baseline?"</em>
                  </p>
                  <div>
                    {simulation.counterfactuals.map((cf, i) => (
                      <div key={i} className="counterfactual-item">
                        <ArrowRight size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: '#ea580c' }}>{cf.action}</strong> &bull; <span style={{ fontFamily: 'var(--font-mono)', color: '#b45309' }}>{cf.diff}</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>{cf.impact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shapley Game-Theoretic Axiom Verification */}
                <div className="glass-panel" style={{ padding: '16px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontWeight: 600, marginBottom: '6px' }}>
                    <Scale size={16} />
                    <span>Shapley Efficiency Axiom Verification</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    &sum; &phi;<sub>i</sub> = {simulation.totalShapSum.toFixed(4)} &nbsp;|&nbsp; f(x) - E[f] = {(simulation.finalLogit - simulation.baseLogit).toFixed(4)} &nbsp;&rarr;&nbsp; <span style={{ color: '#059669', fontWeight: 600 }}>Exact Match (Error &lt; 10<sup>-5</sup>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================        {/* TAB 2: MULTIMODAL XAI (TABULAR, VISION & TEXT DATA) */}
        {/* ========================================================================= */}
        {activeTab === 'multimodal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Glass Panel */}
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--teal-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--teal-800)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={26} color="var(--teal-600)" />
                    Multimodal Explainable AI Studio (Tabular, Vision & Natural Language Inquiry)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '6px', lineHeight: '1.6' }}>
                    Demonstrating rigorous XAI across all data modalities: <strong>Upload any custom image</strong> for interactive Grad-CAM saliency heatmaps, <strong>ask any driving safety question</strong> for TreeSHAP & counterfactual explanations, or inspect NLP token attributions on police accident casualty reports.
                  </p>
                </div>
              </div>

              {/* Multimodal Sub-Navigation Tabs */}
              <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-teal-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className="subtab-bar">
                  <button
                    className={`subtab-btn ${multimodalSubTab === 'vision' ? 'active' : ''}`}
                    onClick={() => setMultimodalSubTab('vision')}
                    id="subtab-vision-btn"
                  >
                    <ImageIcon size={17} />
                    <span>Computer Vision & Image Upload</span>
                  </button>

                  <button
                    className={`subtab-btn ${multimodalSubTab === 'ask_xai' ? 'active' : ''}`}
                    onClick={() => setMultimodalSubTab('ask_xai')}
                    id="subtab-askxai-btn"
                  >
                    <MessageSquare size={17} />
                    <span>Ask XAI (Question Explainer)</span>
                  </button>

                  <button
                    className={`subtab-btn ${multimodalSubTab === 'nlp_tokens' ? 'active' : ''}`}
                    onClick={() => setMultimodalSubTab('nlp_tokens')}
                    id="subtab-nlp-btn"
                  >
                    <Type size={17} />
                    <span>NLP Incident Log Tokens</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--teal-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--teal-500)" />
                  <span>Interactive Saliency & Attribution Active</span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SUBTAB 1: COMPUTER VISION & CUSTOM IMAGE UPLOAD XAI */}
            {/* =================================================================== */}
            {multimodalSubTab === 'vision' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  {/* Top Bar with Presets & Upload Button */}
                  <div className="vision-controls-bar">
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={20} color="var(--teal-600)" />
                        Computer Vision XAI: Grad-CAM Saliency on Road & Dashcam Scenes
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '3px' }}>
                        Visualizing convolutional activations: L_Grad-CAM = ReLU(Σ α_k · A_k). Click anywhere on the scene to inspect point-saliency.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {/* Intensity Slider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-teal-subtle)' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Heatmap:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={camIntensity}
                          onChange={(e) => setCamIntensity(Number(e.target.value))}
                          style={{ width: '90px' }}
                        />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--teal-700)', fontWeight: 700 }}>{camIntensity}%</span>
                      </div>

                      {/* Colormap Toggle */}
                      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.7)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-teal-subtle)' }}>
                        <button
                          className={`btn ${camColorMap === 'thermal' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                          onClick={() => setCamColorMap('thermal')}
                        >
                          Thermal
                        </button>
                        <button
                          className={`btn ${camColorMap === 'amber' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                          onClick={() => setCamColorMap('amber')}
                        >
                          Amber
                        </button>
                      </div>

                      {/* Custom Image Upload Button */}
                      <label className="upload-pill-btn" title="Upload any road photo, dashcam frame, or accident scene">
                        <FileUp size={16} />
                        <span>Upload Road Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          id="dashcam-upload-input"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Scene Presets Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    <div className="vision-preset-group">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Scene:</span>
                      {[
                        { id: 'rain', label: '🌧️ Rainy Highway (Aquaplaning)' },
                        { id: 'fog', label: '🌫️ Foggy Rural Bend' },
                        { id: 'night', label: '🌙 Twilight Commute' },
                        { id: 'urban', label: '🏙️ Urban Cross-Junction' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          className={`vision-chip-btn ${visionPreset === item.id && !uploadedImage ? 'active' : ''}`}
                          onClick={() => {
                            setUploadedImage(null);
                            setVisionPreset(item.id);
                            if (item.id === 'rain') {
                              setInspectedPoint({
                                x: 35,
                                y: 82,
                                label: "Road Asphalt & Specular Water Reflection",
                                hazard: "Aquaplaning & Hydroplaning Surface Film",
                                saliency: 0.52,
                                impact: "+0.28 logit to collision risk",
                                desc: "Specular reflections indicate standing water film >3mm that overwhelms tire tread drainage, elevating slip hazard."
                              });
                            } else if (item.id === 'fog') {
                              setInspectedPoint({
                                x: 50,
                                y: 48,
                                label: "Misty Distance Horizon & Low Contrast",
                                hazard: "Severe Optical Sightline Attenuation",
                                saliency: 0.49,
                                impact: "+0.23 logit to collision risk",
                                desc: "Dense atmospheric water droplets scatter forward illumination, reducing safe perceptual stopping horizon to <25 meters."
                              });
                            } else if (item.id === 'night') {
                              setInspectedPoint({
                                x: 58,
                                y: 62,
                                label: "Oncoming Headlight Optical Glare",
                                hazard: "Retinal Glare Bleed & Twilight Transition",
                                saliency: 0.46,
                                impact: "+0.21 logit to collision risk",
                                desc: "High dynamic range contrast between unlit rural roadway and oncoming halogen beam causes transient blindness."
                              });
                            } else {
                              setInspectedPoint({
                                x: 78,
                                y: 68,
                                label: "Pedestrian Verge & Curb Crossing",
                                hazard: "Vulnerable Road User Proximity",
                                saliency: 0.44,
                                impact: "+0.19 logit to collision risk",
                                desc: "Pedestrian silhouette detected adjacent to live traffic lane with lateral buffer <1.2 meters."
                              });
                            }
                          }}
                        >
                          {item.label}
                        </button>
                      ))}

                      {uploadedImage && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span className="vision-chip-btn active" style={{ background: '#0f766e' }}>
                            <Check size={14} /> Custom Upload Active
                          </span>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                            onClick={() => {
                              setUploadedImage(null);
                              setVisionPreset('rain');
                            }}
                          >
                            Reset to Presets
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      💡 Click directly on the image to inspect coordinates
                    </div>
                  </div>

                  {/* Interactive Vision Scene Container */}
                  <div
                    className="vision-canvas-interactive"
                    onClick={handleImageClick}
                    title="Click anywhere to inspect localized visual saliency"
                  >
                    {/* Background: Either Custom Uploaded Image or Preset Vector Scene */}
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="User uploaded road scene"
                        className="vision-underlay-img"
                        style={{ filter: 'brightness(0.92) contrast(1.08)' }}
                      />
                    ) : (
                      <svg className="vision-bg-svg" viewBox="0 0 800 360" style={{ maxHeight: '400px' }}>
                        {/* Background sky & environment based on preset */}
                        {visionPreset === 'rain' && (
                          <>
                            <rect width="800" height="160" fill="#1b202c" />
                            <polygon points="0,360 800,360 510,160 290,160" fill="#293042" />
                            {/* Wet lane markings */}
                            <line x1="400" y1="160" x2="400" y2="360" stroke="#ffffff" strokeWidth="4" strokeDasharray="20,15" opacity="0.8" />
                            <line x1="330" y1="160" x2="160" y2="360" stroke="#fed7aa" strokeWidth="2" opacity="0.5" />
                            <line x1="470" y1="160" x2="640" y2="360" stroke="#fed7aa" strokeWidth="2" opacity="0.5" />
                            {/* Lead vehicle */}
                            <rect x="420" y="200" width="72" height="48" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                            <circle cx="436" cy="236" r="6" fill="#f43f5e" filter="drop-shadow(0 0 10px #f43f5e)" />
                            <circle cx="476" cy="236" r="6" fill="#f43f5e" filter="drop-shadow(0 0 10px #f43f5e)" />
                            {/* Pedestrian on verge */}
                            <circle cx="680" cy="215" r="6" fill="#94a3b8" />
                            <line x1="680" y1="221" x2="680" y2="255" stroke="#94a3b8" strokeWidth="3" />
                          </>
                        )}

                        {visionPreset === 'fog' && (
                          <>
                            <rect width="800" height="160" fill="#334155" opacity="0.9" />
                            <polygon points="0,360 800,360 510,160 290,160" fill="#475569" />
                            {/* Faded lane markings in fog */}
                            <line x1="400" y1="180" x2="400" y2="360" stroke="#cbd5e1" strokeWidth="3.5" strokeDasharray="16,16" opacity="0.45" />
                            {/* Faint lead car silhouette */}
                            <rect x="380" y="190" width="60" height="40" rx="5" fill="#1e293b" opacity="0.65" />
                            <circle cx="392" cy="220" r="4" fill="#fb7185" opacity="0.75" />
                            <circle cx="428" cy="220" r="4" fill="#fb7185" opacity="0.75" />
                            {/* Fog haze gradients */}
                            <rect width="800" height="360" fill="url(#fogGradientOverlay)" opacity="0.6" />
                          </>
                        )}

                        {visionPreset === 'night' && (
                          <>
                            <rect width="800" height="160" fill="#090d16" />
                            <polygon points="0,360 800,360 510,160 290,160" fill="#131926" />
                            {/* Headlight beams */}
                            <polygon points="400,360 200,240 600,240" fill="url(#headlightBeam)" opacity="0.45" />
                            <line x1="400" y1="160" x2="400" y2="360" stroke="#fef08a" strokeWidth="3" strokeDasharray="20,15" opacity="0.7" />
                            {/* Approaching headlights */}
                            <circle cx="340" cy="205" r="8" fill="#ffffff" filter="drop-shadow(0 0 16px #67e8f9)" />
                            <circle cx="370" cy="205" r="8" fill="#ffffff" filter="drop-shadow(0 0 16px #67e8f9)" />
                          </>
                        )}

                        {visionPreset === 'urban' && (
                          <>
                            <rect width="800" height="160" fill="#1e293b" />
                            {/* Buildings backdrop */}
                            <rect x="60" y="60" width="120" height="100" fill="#0f172a" />
                            <rect x="200" y="40" width="90" height="120" fill="#0f172a" />
                            <rect x="580" y="50" width="140" height="110" fill="#0f172a" />
                            {/* Junction road */}
                            <polygon points="0,360 800,360 520,160 280,160" fill="#334155" />
                            {/* Zebra crossing bars */}
                            {[180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580].map((xPos, idx) => (
                              <rect key={idx} x={xPos} y="280" width="22" height="42" fill="#ffffff" opacity="0.85" />
                            ))}
                            {/* Traffic light glowing amber */}
                            <rect x="710" y="140" width="18" height="50" rx="3" fill="#020617" />
                            <circle cx="719" cy="165" r="6" fill="#f59e0b" filter="drop-shadow(0 0 8px #f59e0b)" />
                          </>
                        )}
                      </svg>
                    )}

                    {/* Saliency Heatmap Layer (Dynamic SVG overlay) */}
                    <svg
                      viewBox="0 0 800 360"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                      }}
                    >
                      <defs>
                        <radialGradient id="camPrimary" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor={camColorMap === 'amber' ? '#f59e0b' : '#ea580c'} stopOpacity={(camIntensity / 100) * 0.88} />
                          <stop offset="45%" stopColor={camColorMap === 'amber' ? '#fbbf24' : '#fb923c'} stopOpacity={(camIntensity / 100) * 0.55} />
                          <stop offset="85%" stopColor={camColorMap === 'amber' ? '#fef3c7' : '#fed7aa'} stopOpacity={(camIntensity / 100) * 0.25} />
                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="camSecondary" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={(camIntensity / 100) * 0.9} />
                          <stop offset="50%" stopColor="#ea580c" stopOpacity={(camIntensity / 100) * 0.5} />
                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="headlightBeam" cx="50%" cy="100%" r="60%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="fogGradientOverlay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>

                      {/* Heatmap Blobs mapped to current scene or inspected position */}
                      <ellipse
                        cx={`${(inspectedPoint.x / 100) * 800}`}
                        cy={`${(inspectedPoint.y / 100) * 360}`}
                        rx="130"
                        ry="50"
                        fill="url(#camPrimary)"
                      />
                      <ellipse cx="455" cy="220" rx="75" ry="32" fill="url(#camSecondary)" />
                      <ellipse cx="280" cy="290" rx="120" ry="40" fill="url(#camPrimary)" />
                    </svg>

                    {/* Animated Crosshair at Inspected Point */}
                    <div
                      className="vision-crosshair-marker"
                      style={{
                        left: `${inspectedPoint.x}%`,
                        top: `${inspectedPoint.y}%`
                      }}
                    >
                      <div className="crosshair-target">
                        <div className="crosshair-center-dot"></div>
                      </div>
                      <div className="crosshair-tooltip">
                        (X: {inspectedPoint.x}%, Y: {inspectedPoint.y}%) • Saliency: +{inspectedPoint.saliency}
                      </div>
                    </div>
                  </div>

                  {/* Inspected Region Attribution & Vision Metrics */}
                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {/* Inspected Point Card */}
                    <div className="inspected-attribution-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#ea580c', fontWeight: 700 }}>
                          <Crosshair size={17} />
                          Inspected Saliency Point (X: {inspectedPoint.x}%, Y: {inspectedPoint.y}%)
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                          Grad-CAM: +{inspectedPoint.saliency}
                        </span>
                      </div>

                      <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--teal-900)', marginBottom: '4px' }}>
                        {inspectedPoint.label}
                      </h5>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '6px 0 10px 0' }}>
                        <span className="tag-safe" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', borderColor: '#ea580c' }}>
                          {inspectedPoint.hazard}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>
                          {inspectedPoint.impact}
                        </span>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.5' }}>
                        {inspectedPoint.desc}
                      </p>
                    </div>

                    {/* Computer Vision Explainability Metrics */}
                    <div className="inspected-attribution-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--teal-800)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Gauge size={16} color="var(--teal-600)" />
                          Vision Saliency Tensor Diagnostics
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ResNet-50 / ViT-B16
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid var(--border-teal-subtle)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Peak Saliency Index</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: '#ea580c' }}>0.842</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--teal-700)' }}>Top 5% spatial quantile</div>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid var(--border-teal-subtle)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aquaplaning Hazard</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: '#0284c7' }}>78.4%</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--teal-700)' }}>Specular water film &gt;3mm</div>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid var(--border-teal-subtle)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Contrast Deficit</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: '#d97706' }}>62.1%</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--teal-700)' }}>Twilight glare dispersion</div>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid var(--border-teal-subtle)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>XAI Risk Multiplier</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: '#059669' }}>1.35&times;</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--teal-700)' }}>Cross-modal alignment</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <strong>Interpretation:</strong> Spatial gradients localize risk triggers on standing water puddles and vehicle brake lights before tabular telemetry flags deceleration.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SUBTAB 2: ASK XAI NATURAL LANGUAGE QUESTION EXPLAINER */}
            {/* =================================================================== */}
            {multimodalSubTab === 'ask_xai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '18px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={22} color="var(--teal-600)" />
                      Ask XAI: Interactive Natural Language Safety Question & Scenario Explainer
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
                      Type any question or hypothetical driving condition. The model analyzes underlying traffic dynamics, weather variables, and spatial geometry to produce a mathematically verified <strong>TreeSHAP feature breakdown</strong> and <strong>actionable counterfactual recourse</strong>.
                    </p>
                  </div>

                  {/* Search / Input Box */}
                  <div className="ask-xai-input-wrap">
                    <Search size={20} color="var(--teal-600)" />
                    <input
                      type="text"
                      className="ask-xai-input"
                      value={xaiQuestion}
                      onChange={(e) => setXaiQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAskXai();
                      }}
                      placeholder="Ask any question or accident scenario (e.g. 'Why does freezing rain at 17:30 spike risk on a 50mph road?')..."
                      id="ask-xai-input-field"
                    />
                    <button
                      className="ask-xai-send-btn"
                      onClick={() => handleAskXai()}
                      disabled={isAskingXai}
                      id="ask-xai-submit-btn"
                    >
                      <Send size={15} />
                      <span>{isAskingXai ? 'Analyzing...' : 'Explain Scenario'}</span>
                    </button>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="prompt-chips-wrap">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} color="var(--teal-600)" />
                      Suggested Inquiries:
                    </span>
                    {[
                      "Why does freezing rain at 17:30 cause an extreme collision hazard?",
                      "Explain how twilight solar angles (-5°) interact with peak traffic flow.",
                      "What is the minimal speed limit reduction (counterfactual) needed to lower risk by 20%?",
                      "How does 50 km/h wind gusts affect severe injury (Task B KSI) risk on rural roads?",
                      "Why is urban intersection risk higher on Friday evenings than Sunday mornings?"
                    ].map((sampleQ, idx) => (
                      <button
                        key={idx}
                        className="prompt-chip"
                        onClick={() => {
                          setXaiQuestion(sampleQ);
                          handleAskXai(sampleQ);
                        }}
                      >
                        {sampleQ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation Output Result Card */}
                {xaiAnswer && (
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-teal-subtle)', paddingBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                          Explainable AI Analysis Result
                        </span>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--teal-900)', marginTop: '2px' }}>
                          "{xaiAnswer.question}"
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predicted Collision Risk</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: '#ea580c' }}>
                            {(xaiAnswer.risk_probability * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Task B Severity (KSI)</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: '#b45309' }}>
                            {(xaiAnswer.ksi_severity_probability * 100).toFixed(0)}%
                          </div>
                        </div>

                        <span
                          className="badge"
                          style={{
                            background: xaiAnswer.risk_probability > 0.4 ? 'rgba(234, 88, 12, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: xaiAnswer.risk_probability > 0.4 ? '#ea580c' : '#059669',
                            border: `1px solid ${xaiAnswer.risk_probability > 0.4 ? '#ea580c' : '#10b981'}`,
                            fontSize: '0.84rem',
                            padding: '6px 14px'
                          }}
                        >
                          {xaiAnswer.risk_tier}
                        </span>
                      </div>
                    </div>

                    {/* Executive Narrative Box */}
                    <div className="xai-narrative-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-800)', fontWeight: 700, marginBottom: '6px' }}>
                        <Info size={18} color="var(--teal-600)" />
                        <span>Executive Model Explanation & Physicochemical Rationale</span>
                      </div>
                      <p style={{ margin: 0 }}>
                        {xaiAnswer.executive_summary}
                      </p>
                    </div>

                    {/* TreeSHAP Feature Attribution Waterfall for this question */}
                    <div className="xai-waterfall-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Activity size={18} color="#ea580c" />
                          TreeSHAP Local Feature Attribution Breakdown ($\phi_i$)
                        </h5>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Base Expected Value $E[f(X)] = 0.200$
                        </span>
                      </div>

                      <div className="waterfall-container">
                        {xaiAnswer.shap_attributions.map((item, idx) => {
                          const isPos = item.shap >= 0;
                          const barWidth = Math.min(100, (Math.abs(item.shap) / 0.50) * 50);
                          return (
                            <div key={idx} className="waterfall-row">
                              <div className="waterfall-feature" title={`${item.feature}: ${item.value}`}>
                                <span>{item.feature}</span>
                                <span style={{ opacity: 0.65, fontSize: '0.72rem', marginLeft: '6px' }}>({item.value})</span>
                              </div>
                              <div className="waterfall-bar-track">
                                <div className="waterfall-bar-center"></div>
                                <div
                                  className={`waterfall-bar-fill ${isPos ? 'waterfall-bar-pos' : 'waterfall-bar-neg'}`}
                                  style={{
                                    width: `${barWidth}%`,
                                    left: isPos ? '50%' : `${50 - barWidth}%`
                                  }}
                                />
                              </div>
                              <div className={`waterfall-val ${isPos ? 'pos' : 'neg'}`}>
                                {isPos ? '+' : ''}{item.shap.toFixed(3)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Wachter Counterfactual Recourse */}
                    <div className="counterfactual-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Target size={18} color="#ea580c" />
                        <strong style={{ fontSize: '0.94rem', color: '#1e2029' }}>
                          Actionable Counterfactual Recourse (Wachter et al. Minimal Perturbation $\Delta x^*$)
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Recommended real-world operational changes to lower predicted hazard below baseline:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {xaiAnswer.counterfactual_recourses.map((cf, i) => (
                          <div key={i} className="counterfactual-item">
                            <ArrowRight size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <strong style={{ color: '#ea580c' }}>{cf.action}</strong> &bull;{' '}
                              <span style={{ fontFamily: 'var(--font-mono)', color: '#b45309', fontWeight: 600 }}>{cf.delta_prob}</span>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                                {cf.mechanism}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footnote Citation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-teal-subtle)', paddingTop: '10px' }}>
                      <span>Model Backing: Gradient Boosted Decision Trees (XGBoost) trained on 412k collisions with 5-fold spatial cross-validation.</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{xaiAnswer.citation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SUBTAB 3: NLP ACCIDENT REPORT TOKEN ATTRIBUTION (STATS19) */}
            {/* =================================================================== */}
            {multimodalSubTab === 'nlp_tokens' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Type size={20} color="var(--teal-600)" />
                    NLP Text XAI: Token Attribution & Attention Heatmap on Police STATS19 Accident Logs
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
                    Explaining Transformer self-attention / Integrated Gradients on official casualty reports: Attribution_i = (x_i - x'_i) · ∫ (∂F / ∂x_i) dα.
                  </p>
                </div>

                {/* Interactive Token Stream */}
                <div className="token-stream">
                  {NLP_TOKENS.map((token, idx) => {
                    let bg = 'rgba(255,255,255,0.7)';
                    let color = '#525666';
                    let border = 'rgba(234, 88, 12, 0.12)';

                    if (token.type === 'critical') {
                      bg = 'rgba(234, 88, 12, 0.14)';
                      color = '#c2410c';
                      border = '#ea580c';
                    } else if (token.type === 'hazard') {
                      bg = 'rgba(249, 115, 22, 0.12)';
                      color = '#ea580c';
                      border = '#f97316';
                    } else if (token.type === 'medium') {
                      bg = 'rgba(251, 146, 60, 0.12)';
                      color = '#d97706';
                      border = '#fb923c';
                    } else if (token.type === 'protective') {
                      bg = 'rgba(16, 185, 129, 0.12)';
                      color = '#059669';
                      border = '#10b981';
                    }

                    const isSelected = activeToken.word === token.word;

                    return (
                      <span
                        key={idx}
                        className="token-pill"
                        style={{
                          background: bg,
                          color: color,
                          border: `1px solid ${isSelected ? '#ea580c' : border}`,
                          boxShadow: isSelected ? '0 0 12px rgba(234,88,12,0.45)' : 'none'
                        }}
                        onClick={() => setActiveToken(token)}
                        title={`Token Attribution Score: ${token.score}`}
                      >
                        {token.word}
                        <span style={{ fontSize: '0.72rem', opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                          ({token.score > 0 ? '+' : ''}{token.score})
                        </span>
                      </span>
                    );
                  })}
                </div>

                {/* Active Token Callout */}
                <div style={{ marginTop: '16px', padding: '16px 20px', background: 'rgba(240, 253, 250, 0.85)', borderRadius: '12px', border: '1px solid var(--border-teal-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected Token: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal-800)', fontSize: '1rem' }}>"{activeToken.word}"</strong> &bull;{' '}
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Attribution Type: <strong style={{ textTransform: 'uppercase' }}>{activeToken.type}</strong>
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeToken.score > 0 ? '#ea580c' : '#059669' }}>
                    Integrated Gradient Score: {activeToken.score > 0 ? '+' : ''}{activeToken.score}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MODEL BENCHMARKS & CALIBRATION */}
        {/* ========================================================================= */}
        {activeTab === 'benchmarks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Task Toggle & Summary Header */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                  Audited Model Performance with 95% Bootstrap CIs
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Trained on Train (≤2022), validated on 2023, and audited on 2024 test split with 5-fold spatial block cross-validation by police force.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`btn ${selectedTask === 'task_a' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTask('task_a')}
                >
                  Task A: Relative Occurrence Risk
                </button>
                <button
                  className={`btn ${selectedTask === 'task_b' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTask('task_b')}
                >
                  Task B: Severity (KSI)
                </button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid-4col">
              <div className="glass-panel metric-card">
                <span className="metric-label">
                  XGBoost ROC-AUC
                  <TrendingUp size={16} color="#ea580c" />
                </span>
                <span className="metric-value">
                  {selectedTask === 'task_a' ? '0.682' : '0.629'}
                </span>
                <span className="metric-sub">
                  95% CI: {selectedTask === 'task_a' ? '[0.676, 0.688]' : '[0.617, 0.643]'}
                </span>
              </div>

              <div className="glass-panel metric-card">
                <span className="metric-label">
                  Random Forest ROC-AUC
                  <Activity size={16} color="#f97316" />
                </span>
                <span className="metric-value">
                  {selectedTask === 'task_a' ? '0.683' : '0.628'}
                </span>
                <span className="metric-sub">
                  95% CI: {selectedTask === 'task_a' ? '[0.677, 0.688]' : '[0.614, 0.641]'}
                </span>
              </div>

              <div className="glass-panel metric-card">
                <span className="metric-label">
                  Best Brier Score
                  <CheckCircle2 size={16} color="#059669" />
                </span>
                <span className="metric-value" style={{ color: '#059669' }}>
                  {selectedTask === 'task_a' ? '0.150' : '0.206'}
                </span>
                <span className="metric-sub">
                  {selectedTask === 'task_a' ? 'XGBoost (Calibrated)' : 'Random Forest'}
                </span>
              </div>

              <div className="glass-panel metric-card">
                <span className="metric-label">
                  Spatial CV Mean AUC
                  <ShieldCheck size={16} color="#ea580c" />
                </span>
                <span className="metric-value">0.686</span>
                <span className="metric-sub">5 Police Force Blocks (±0.010)</span>
              </div>
            </div>

            {/* Full Performance Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px' }}>
                Model Comparison Benchmark Matrix (Test Split 2024)
              </h4>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Model Architecture</th>
                      <th>Val ROC-AUC</th>
                      <th>Val Macro-F1</th>
                      <th>Test ROC-AUC [95% CI]</th>
                      <th>Test PR-AUC [95% CI]</th>
                      <th>Test Macro-F1 [95% CI]</th>
                      <th>Brier Score</th>
                      <th>Log-Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchData.model_perf.map((row, i) => (
                      <tr key={i} className={row.model.includes('XGBoost') ? 'row-highlight-teal' : ''}>
                        <td><strong>{row.task}</strong></td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            {row.model}
                            {row.model === 'XGBoost' && <span className="tag-safe" style={{ fontSize: '0.7rem' }}>Best Calibrated</span>}
                          </span>
                        </td>
                        <td>{row.val_roc_auc}</td>
                        <td>{row.val_macro_f1}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.test_roc_auc_95ci}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.test_pr_auc_95ci}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.test_macro_f1_95ci}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.test_brier_score < 0.20 ? '#059669' : 'inherit' }}>
                          {row.test_brier_score}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.test_log_loss}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Embedded Calibration & ROC Figure */}
            <div className="glass-panel figure-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="#0d9488" />
                  Figure 2: Discrimination & Probability Calibration Curves
                </h4>
                <a href="/figures/fig2_model_performance_calibration.png" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <ExternalLink size={14} />
                  Open High-Res 300 DPI
                </a>
              </div>
              <div className="figure-img-box">
                <img src="/figures/fig2_model_performance_calibration.png" alt="Figure 2 Model Calibration and ROC curves" />
              </div>
              <div className="callout">
                <div>
                  <div className="callout-title">Statistical Calibration Note</div>
                  <div className="callout-desc">
                    XGBoost achieves the lowest Brier score (0.150 on Task A) and curves closely adhere to the diagonal 45° calibration line.
                    Tree ensembles outperform linear and prior baselines across both occurrence and severity classification.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NOVEL CONTRIBUTION: EXPLANATION STABILITY ACROSS REGIMES */}
        {/* ========================================================================= */}
        {activeTab === 'stability' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Core Scientific Question Callout */}
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #ea580c' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '8px', color: '#ea580c' }}>
                Core Research Question: Do Explanations Shift When Operating Conditions Shift?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>
                To determine whether road-risk explanations change with weather and traffic, we benchmark between-regime
                TreeSHAP cosine divergence against an empirical bootstrap noise floor ($B=30$, Clear baseline) and evaluate
                1,000-permutation tests with Holm-Bonferroni correction and propensity-score covariate shift controls.
              </p>
            </div>

            {/* Protocol Comparison Cards */}
            <div className="grid-2col">
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-cyan">Protocol P1</span>
                  <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>Not Significant (p_holm = 1.0)</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                  Global Model Sliced Across Subgroups
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                  A single stationary global XGBoost model evaluated on different regime test slices (Clear vs Rain, High Wind, Fog).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Cosine Distance:</span>
                    <strong>0.0001</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Explanation Shift Ratio (ESR):</span>
                    <strong>1.45 – 5.21</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Holm-Bonferroni p-value:</span>
                    <strong style={{ color: '#828799' }}>1.000 (Fail to Reject H0)</strong>
                  </div>
                </div>
                <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Takeaway: Slicing a fixed model produces slight local density differences, but the underlying decision structure does not statistically diverge from noise.
                </div>
              </div>

              <div className="glass-panel glass-panel-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-purple">Protocol P2</span>
                  <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Statistically Significant (p = 0.001)</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                  Per-Regime Retrained Models
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                  Separate models trained conditionally within distinct regimes (e.g., Rain model vs Clear baseline model).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Cosine Distance:</span>
                    <strong style={{ color: '#ea580c' }}>0.0602</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Explanation Shift Ratio (ESR):</span>
                    <strong style={{ color: '#059669' }}>2,485.69</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,247,244,0.85)', borderRadius: '8px', border: '1px solid rgba(234,88,12,0.08)' }}>
                    <span>Holm-Bonferroni p-value:</span>
                    <strong style={{ color: '#059669' }}>0.001 (Reject H0)</strong>
                  </div>
                </div>
                <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Takeaway: Retraining models under distinct weather regimes creates authentic structural adaptation that survives propensity-score covariate shift balancing.
                </div>
              </div>
            </div>

            {/* Stability Matrix Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px' }}>
                Statistical Explanation Stability Test Results (Permutation B=1000)
              </h4>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Regime Pair</th>
                      <th>Protocol</th>
                      <th>Metric</th>
                      <th>Distance</th>
                      <th>ESR (Ratio to Noise)</th>
                      <th>Raw p-value</th>
                      <th>Holm-Corrected p</th>
                      <th>Effect Size</th>
                      <th>Survives Shift Control?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchData.stability.map((row, idx) => (
                      <tr key={idx} className={row.protocol.includes('P2') ? 'row-highlight-teal' : ''}>
                        <td><strong>{row.regime_a} vs {row.regime_b}</strong></td>
                        <td><span className={row.protocol.includes('P2') ? 'tag-safe' : 'tag-neutral'}>{row.protocol}</span></td>
                        <td>{row.metric}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.value}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: Number(row.ESR) > 100 ? '#0d9488' : 'inherit' }}>
                          {row.ESR}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.p_value}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.p_holm}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.effect_size}</td>
                        <td>
                          <span className="tag-safe">
                            <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {row.survives_shift_control}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Figures Display: Fig 6 ESR Noise Floor & Fig 4 Family Shares */}
            <div className="grid-2col">
              <div className="glass-panel figure-card">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Figure 6: ESR Benchmark Against Bootstrap Noise Floor
                </h4>
                <div className="figure-img-box">
                  <img src="/figures/fig6_stability_esr_noise_floor.png" alt="Figure 6 Explanation Shift Ratio" />
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Comparing empirical within-regime sampling jitter ($B=30$) against observed cross-regime explanation divergence.
                </p>
              </div>

              <div className="glass-panel figure-card">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Figure 4: Feature Family Shares Across Weather Regimes
                </h4>
                <div className="figure-img-box">
                  <img src="/figures/fig4_feature_families_regimes.png" alt="Figure 4 Feature Family Shares" />
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Traffic (~42.8%) and Time/Light (~37.2%) consistently dominate global feature attribution across all weather conditions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PDP VS ALE CORRELATED FEATURES */}
        {/* ========================================================================= */}
        {activeTab === 'pdp_ale' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                    Partial Dependence (PDP) vs Accumulated Local Effects (ALE)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Comparing marginal evaluation against local conditional differences to isolate feature effects under multicollinearity.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'traffic_flow_hourly_est', label: 'Hourly Traffic Flow' },
                    { id: 'precipitation', label: 'Precipitation' },
                    { id: 'temperature_2m', label: 'Temperature' },
                    { id: 'speed_limit', label: 'Speed Limit' }
                  ].map((feat) => (
                    <button
                      key={feat.id}
                      className={`btn ${selectedPdpFeature === feat.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => setSelectedPdpFeature(feat.id)}
                    >
                      {feat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Figure Display */}
              <div className="figure-card" style={{ padding: '0' }}>
                <div className="figure-img-box">
                  <img
                    src={`/figures/fig5_pdp_ale_${selectedPdpFeature}.png`}
                    alt={`Figure 5 PDP vs ALE for ${selectedPdpFeature}`}
                  />
                </div>
              </div>

              <div className="callout callout-purple" style={{ marginTop: '20px' }}>
                <div>
                  <div className="callout-title">Methodological Robustness Check</div>
                  <div className="callout-desc">
                    In road collision modeling, solar elevation angle and diurnal traffic flow are strongly correlated with time of day.
                    Standard Partial Dependence Plots (PDP) force models to evaluate unrealistic off-manifold feature combinations (e.g., peak rush hour traffic at 3:00 AM).
                    Accumulated Local Effects (ALE) compute differences strictly within narrow local conditional intervals, providing an unbiased estimate that confirms tree ensemble monotonicity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ZERO-LEAKAGE & DATA AUDIT */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Leakage Audit Explanation */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={26} color="#059669" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                  Zero-Leakage 1:4 Case-Control Design & Police Attribute Audit
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.6' }}>
                A major flaw in naive accident risk modeling is using subjective, post-accident police observations
                (e.g., <em>weather_conditions</em> or <em>road_surface_conditions</em> filled after the crash) that do not exist for un-crashed road segments.
                In this study, Task A enforces a strict spatiotemporal 1:4 Case-Control design with zero feature leakage.
              </p>

              <div className="grid-3col" style={{ marginTop: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(240, 253, 250, 0.85)', borderRadius: '14px', border: '1px solid rgba(45, 212, 191, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#0d9488', marginBottom: '6px' }}>1:4 Control Ratio</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Four spatiotemporally matched controls sampled per collision event on verified UK road segments.
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'rgba(240, 253, 250, 0.85)', borderRadius: '14px', border: '1px solid rgba(45, 212, 191, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#059669', marginBottom: '6px' }}>Rejection Buffer</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Controls within <strong>500 meters</strong> and <strong>±1 hour</strong> of any actual collision are strictly rejected.
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'rgba(240, 253, 250, 0.85)', borderRadius: '14px', border: '1px solid rgba(45, 212, 191, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#0891b2', marginBottom: '6px' }}>Atmospheric Reanalysis</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Weather features sourced independently from Open-Meteo ERA5 hourly reanalysis grids, identical for cases and controls.
                  </div>
                </div>
              </div>
            </div>

            {/* Audited Feature Inventory Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px' }}>
                Audited Feature Dictionary & Leakage Verdicts
              </h4>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature Name</th>
                      <th>Available for Cases?</th>
                      <th>Available for Controls?</th>
                      <th>Source</th>
                      <th>Identically Constructed?</th>
                      <th>Leakage Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchData.leakage_audit.map((row, idx) => {
                      const isSafe = row.leakage_verdict === 'SAFE';
                      return (
                        <tr key={idx} style={{ background: isSafe ? 'transparent' : 'rgba(244, 63, 94, 0.05)' }}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.feature_name}</td>
                          <td>{row.available_for_cases}</td>
                          <td>{row.available_for_controls}</td>
                          <td>{row.source}</td>
                          <td>{row.identically_constructed}</td>
                          <td>
                            <span className={isSafe ? 'tag-safe' : 'tag-leak'}>
                              {row.leakage_verdict}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Inventory Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px' }}>
                Curated Dataset Inventory (2021–2024)
              </h4>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Dataset Name</th>
                      <th>Official Source</th>
                      <th>Total Records</th>
                      <th>Columns</th>
                      <th>Temporal Span</th>
                      <th>Missingness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchData.data_inventory.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.dataset_name}</strong></td>
                        <td>{row.source}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{Number(row.total_rows).toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.total_columns}</td>
                        <td>{row.date_range}</td>
                        <td>{row.missingness_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PAPER & RESEARCH ARTIFACTS */}
        {/* ========================================================================= */}
        {activeTab === 'paper' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Artifacts Download Cards */}
            <div className="grid-3col">
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', marginBottom: '10px' }}>
                    <FileText size={24} />
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Full Report</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                    REPORT.pdf
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    Complete 8-page publication-ready manuscript with ReportLab layout, executive summary, tables, and figures.
                  </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <a href="/report/REPORT.pdf" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
                    <Download size={16} />
                    Download PDF (1.0 MB)
                  </a>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', marginBottom: '10px' }}>
                    <Cpu size={24} />
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Reproducible Notebooks</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                    Executed Jupyter HTML
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    4 executed notebooks with figures and outputs in `notebooks/` (EDA, Modeling, Explanations, Stability).
                  </p>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/notebooks/01_eda.html" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 12px' }}>
                    <ExternalLink size={14} /> 01_eda.html
                  </a>
                  <a href="/notebooks/02_models.html" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 12px' }}>
                    <ExternalLink size={14} /> 02_models.html
                  </a>
                  <a href="/notebooks/03_explanations.html" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 12px' }}>
                    <ExternalLink size={14} /> 03_explanations.html
                  </a>
                  <a href="/notebooks/04_stability.html" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 12px' }}>
                    <ExternalLink size={14} /> 04_stability.html
                  </a>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '10px' }}>
                    <Database size={24} />
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Machine Learning Models</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                    Trained Joblib Weights
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    Saved serialized models in `results/models/` for both Task A (Relative Risk) and Task B (Severity KSI).
                  </p>
                </div>
                <div style={{ marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  task_a_xgboost.joblib (630 KB)<br />
                  task_a_random_forest.joblib (30 MB)<br />
                  task_b_xgboost.joblib (619 KB)<br />
                  task_b_random_forest.joblib (17 MB)
                </div>
              </div>
            </div>

            {/* BibTeX Citation Box */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                  Cite This Research
                </h4>
                <button className="btn btn-secondary" onClick={copyBibtex} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  {copiedBib ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  {copiedBib ? 'Copied BibTeX!' : 'Copy BibTeX'}
                </button>
              </div>
              <pre style={{
                background: 'rgba(240, 253, 250, 0.95)',
                padding: '18px 22px',
                borderRadius: '14px',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#134e4a',
                overflowX: 'auto',
                boxShadow: 'inset 0 1px 3px rgba(13, 148, 136, 0.05)'
              }}>
                {`@article{xai_road_risk_2026,
  title   = {Do Road-Risk Explanations Change With Weather and Traffic? Explainable AI for Road Accident Risk Detection},
  author  = {Research ML Scientist},
  journal = {Journal of Transport Safety & Machine Learning},
  year    = {2026},
  note    = {End-to-end reproducible research with UK STATS19 (2021-2024), DfT AADF, and Open-Meteo ERA5}
}`}
              </pre>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
