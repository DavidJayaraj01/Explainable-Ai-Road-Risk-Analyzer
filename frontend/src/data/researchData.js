// Auto-generated research data bundle from results/
export const researchData = {
  "task_a_metrics": {
    "Prior Baseline": {
      "validation": {
        "roc_auc": 0.5,
        "pr_auc": 0.2,
        "macro_f1": 0.4444444444444444,
        "balanced_accuracy": 0.5,
        "brier_score": 0.1600000000000001,
        "log_loss": 0.5004024235381876
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.5,
          "ci_lower": 0.5,
          "ci_upper": 0.5
        },
        "pr_auc": {
          "value": 0.2,
          "ci_lower": 0.19627585779759693,
          "ci_upper": 0.203523473306082
        },
        "macro_f1": {
          "value": 0.4444444444444444,
          "ci_lower": 0.4433548195501168,
          "ci_upper": 0.4455914974027321
        },
        "balanced_accuracy": {
          "value": 0.5,
          "ci_lower": 0.5,
          "ci_upper": 0.5
        },
        "brier_score": {
          "value": 0.16000000000000011,
          "ci_lower": 0.15776551467855818,
          "ci_upper": 0.16211408398364927
        },
        "log_loss": {
          "value": 0.5004024235381878,
          "ci_lower": 0.49523966620298787,
          "ci_upper": 0.5052869947139658
        }
      },
      "brier_score": 0.16000000000000011,
      "log_loss": 0.5004024235381878,
      "calibration_curve": {
        "prob_pred": [
          0.1999999999998724
        ],
        "prob_true": [
          0.2
        ]
      }
    },
    "Logistic Regression": {
      "validation": {
        "roc_auc": 0.66921610729366,
        "pr_auc": 0.3018422893057395,
        "macro_f1": 0.5178844724638604,
        "balanced_accuracy": 0.6270688414487887,
        "brier_score": 0.22868020656579086,
        "log_loss": 0.6429173303733265
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.6689348644443189,
          "ci_lower": 0.6633272716712358,
          "ci_upper": 0.6743203345356572
        },
        "pr_auc": {
          "value": 0.3002446686609468,
          "ci_lower": 0.29248656784506893,
          "ci_upper": 0.3087520794302203
        },
        "macro_f1": {
          "value": 0.5182673033056961,
          "ci_lower": 0.5129261636141409,
          "ci_upper": 0.5224689586688566
        },
        "balanced_accuracy": {
          "value": 0.6288864114951072,
          "ci_lower": 0.6241786967889403,
          "ci_upper": 0.6337757270196404
        },
        "brier_score": {
          "value": 0.2288730205480561,
          "ci_lower": 0.2276419945381379,
          "ci_upper": 0.23019123213490175
        },
        "log_loss": {
          "value": 0.643207710642797,
          "ci_lower": 0.640455194785324,
          "ci_upper": 0.6460608978512423
        }
      },
      "brier_score": 0.2288730205480561,
      "log_loss": 0.643207710642797,
      "calibration_curve": {
        "prob_pred": [
          0.0949714228407259,
          0.17347784794756912,
          0.23781785437409586,
          0.35605918317180363,
          0.4520371943677891,
          0.5562417085604884,
          0.6421943119796498,
          0.7131412164394334
        ],
        "prob_true": [
          0.25,
          0.052711993888464474,
          0.06101601325234677,
          0.13095749248604552,
          0.18351254480286738,
          0.24374165554072097,
          0.3030116147599959,
          0.34676564156945916
        ]
      }
    },
    "Random Forest": {
      "validation": {
        "roc_auc": 0.683338700560356,
        "pr_auc": 0.31665715493626206,
        "macro_f1": 0.5523625152401836,
        "balanced_accuracy": 0.6318661549532262,
        "brier_score": 0.20975495074978692,
        "log_loss": 0.5974532763500456
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.6831048748484215,
          "ci_lower": 0.6773081896059068,
          "ci_upper": 0.6883616394452332
        },
        "pr_auc": {
          "value": 0.3116028069455036,
          "ci_lower": 0.3031369525821028,
          "ci_upper": 0.32109644124960757
        },
        "macro_f1": {
          "value": 0.5514296789800941,
          "ci_lower": 0.5466442431243032,
          "ci_upper": 0.5560786345322192
        },
        "balanced_accuracy": {
          "value": 0.6322308931004583,
          "ci_lower": 0.626169773880975,
          "ci_upper": 0.637142442655076
        },
        "brier_score": {
          "value": 0.21076279180922688,
          "ci_lower": 0.2093135889392002,
          "ci_upper": 0.2120127062057087
        },
        "log_loss": {
          "value": 0.5993610336612849,
          "ci_lower": 0.5959891252909714,
          "ci_upper": 0.6021668773325407
        }
      },
      "brier_score": 0.21076279180922688,
      "log_loss": 0.5993610336612849,
      "calibration_curve": {
        "prob_pred": [
          0.07849809961031746,
          0.1440107601749348,
          0.2510190637611594,
          0.3507073587319467,
          0.4564885922998476,
          0.5528972591824984,
          0.6431925412939563,
          0.709708119519005
        ],
        "prob_true": [
          0.035016835016835016,
          0.05862361937128292,
          0.09629421673217294,
          0.14977450747685733,
          0.205078125,
          0.25066615911686335,
          0.3324997022746219,
          0.368
        ]
      }
    },
    "XGBoost": {
      "validation": {
        "roc_auc": 0.6824721146083834,
        "pr_auc": 0.31327163264820224,
        "macro_f1": 0.44691296840828204,
        "balanced_accuracy": 0.5007495802350683,
        "brier_score": 0.1498913850853852,
        "log_loss": 0.4654115068575301
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.6819248330862461,
          "ci_lower": 0.6759081043367993,
          "ci_upper": 0.6875130763298725
        },
        "pr_auc": {
          "value": 0.30732899495720845,
          "ci_lower": 0.300539213825467,
          "ci_upper": 0.31587082440909614
        },
        "macro_f1": {
          "value": 0.4460756589371847,
          "ci_lower": 0.4444865204172634,
          "ci_upper": 0.4476742689143116
        },
        "balanced_accuracy": {
          "value": 0.5003096742227178,
          "ci_lower": 0.49978388985223166,
          "ci_upper": 0.5008150441747979
        },
        "brier_score": {
          "value": 0.14999670132021078,
          "ci_lower": 0.1480295060033212,
          "ci_upper": 0.15196944156279732
        },
        "log_loss": {
          "value": 0.465011356141523,
          "ci_lower": 0.4603309302111709,
          "ci_upper": 0.47009273327291207
        }
      },
      "brier_score": 0.14999670132021078,
      "log_loss": 0.465011356141523,
      "calibration_curve": {
        "prob_pred": [
          0.05160340235587036,
          0.15236716620077767,
          0.2512570230406413,
          0.33886453813909206,
          0.4277294947247561,
          0.5356814563274384,
          0.6343101859092712
        ],
        "prob_true": [
          0.057925596441568944,
          0.165470618824753,
          0.25047709923664124,
          0.3302038626609442,
          0.3657587548638132,
          0.28846153846153844,
          0.0
        ]
      }
    }
  },
  "task_b_metrics": {
    "Prior Baseline": {
      "validation": {
        "roc_auc": 0.5,
        "pr_auc": 0.24250419764931638,
        "macro_f1": 0.4310085983349256,
        "balanced_accuracy": 0.5,
        "brier_score": 0.1839969422784086,
        "log_loss": 0.554796994327923
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.5,
          "ci_lower": 0.5,
          "ci_upper": 0.5
        },
        "pr_auc": {
          "value": 0.24798711755233493,
          "ci_lower": 0.23818902514554688,
          "ci_upper": 0.25731450514059206
        },
        "macro_f1": {
          "value": 0.42922794117647056,
          "ci_lower": 0.4261729837667869,
          "ci_upper": 0.43240221783159244
        },
        "balanced_accuracy": {
          "value": 0.5,
          "ci_lower": 0.5,
          "ci_upper": 0.5
        },
        "brier_score": {
          "value": 0.1870108598485741,
          "ci_lower": 0.18162492618890747,
          "ci_upper": 0.19213805080398363
        },
        "log_loss": {
          "value": 0.5615732247036264,
          "ci_lower": 0.5494639594644475,
          "ci_upper": 0.5731007553295452
        }
      },
      "brier_score": 0.1870108598485741,
      "log_loss": 0.5615732247036264,
      "calibration_curve": {
        "prob_pred": [
          0.22515396691216627
        ],
        "prob_true": [
          0.24798711755233493
        ]
      }
    },
    "Logistic Regression": {
      "validation": {
        "roc_auc": 0.6166484691196084,
        "pr_auc": 0.35370221432820553,
        "macro_f1": 0.5472528894255649,
        "balanced_accuracy": 0.5761399776618064,
        "brier_score": 0.23501209451234964,
        "log_loss": 0.6628149843454235
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.6141097413540175,
          "ci_lower": 0.6025962269335086,
          "ci_upper": 0.6303742184770639
        },
        "pr_auc": {
          "value": 0.3547438203452632,
          "ci_lower": 0.3338402682689149,
          "ci_upper": 0.3798953008697495
        },
        "macro_f1": {
          "value": 0.5498371707814304,
          "ci_lower": 0.5393608736686396,
          "ci_upper": 0.5616177461750484
        },
        "balanced_accuracy": {
          "value": 0.5771139994908732,
          "ci_lower": 0.5664595641672755,
          "ci_upper": 0.591257902445666
        },
        "brier_score": {
          "value": 0.23625828871795582,
          "ci_lower": 0.23353691846190397,
          "ci_upper": 0.23847181022223937
        },
        "log_loss": {
          "value": 0.6657084588995821,
          "ci_lower": 0.6598934130026655,
          "ci_upper": 0.6702660441765131
        }
      },
      "brier_score": 0.23625828871795582,
      "log_loss": 0.6657084588995821,
      "calibration_curve": {
        "prob_pred": [
          0.07279157303705301,
          0.16669088068753307,
          0.2675331987561305,
          0.3596522295690658,
          0.45034229358532524,
          0.546568198664149,
          0.6415569710071892,
          0.7409010894262978,
          0.8191441409770548
        ],
        "prob_true": [
          0.6666666666666666,
          0.22727272727272727,
          0.15625,
          0.1619919862621637,
          0.22875816993464052,
          0.2706692913385827,
          0.3518324607329843,
          0.48172757475083056,
          0.6842105263157895
        ]
      }
    },
    "Random Forest": {
      "validation": {
        "roc_auc": 0.6492405577908367,
        "pr_auc": 0.36757868164344,
        "macro_f1": 0.5752808274515471,
        "balanced_accuracy": 0.5743784018607228,
        "brier_score": 0.20178983714033652,
        "log_loss": 0.5909595752771716
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.6279342466132122,
          "ci_lower": 0.6137279343687986,
          "ci_upper": 0.6408092413594094
        },
        "pr_auc": {
          "value": 0.36571151660397444,
          "ci_lower": 0.3451956505774879,
          "ci_upper": 0.3881323520673522
        },
        "macro_f1": {
          "value": 0.5762603176472488,
          "ci_lower": 0.5650168798656354,
          "ci_upper": 0.5875771246841318
        },
        "balanced_accuracy": {
          "value": 0.5745517865432213,
          "ci_lower": 0.5631839274747507,
          "ci_upper": 0.5851416619880987
        },
        "brier_score": {
          "value": 0.20557780812833618,
          "ci_lower": 0.2029537966134314,
          "ci_upper": 0.2079492254916085
        },
        "log_loss": {
          "value": 0.5997034412848974,
          "ci_lower": 0.5938910202176177,
          "ci_upper": 0.6047725000201101
        }
      },
      "brier_score": 0.20557780812833618,
      "log_loss": 0.5997034412848974,
      "calibration_curve": {
        "prob_pred": [
          0.06833537645586578,
          0.16362596478793218,
          0.26576008325577327,
          0.34420658622436473,
          0.4522042694852542,
          0.538537222591711,
          0.6374311563462204,
          0.7445262822287956,
          0.8441464795392799,
          0.9003999413950421
        ],
        "prob_true": [
          0.07142857142857142,
          0.11587982832618025,
          0.1497659906396256,
          0.19957537154989385,
          0.27123050259965337,
          0.33098591549295775,
          0.4426751592356688,
          0.5573770491803278,
          0.7017543859649122,
          1.0
        ]
      }
    },
    "XGBoost": {
      "validation": {
        "roc_auc": 0.649001186442483,
        "pr_auc": 0.3735982399507568,
        "macro_f1": 0.5843367594290956,
        "balanced_accuracy": 0.5911039364958853,
        "brier_score": 0.20383135952389728,
        "log_loss": 0.5935822557127453
      },
      "test_with_ci": {
        "roc_auc": {
          "value": 0.629374331812151,
          "ci_lower": 0.6168350160213414,
          "ci_upper": 0.6432679065612695
        },
        "pr_auc": {
          "value": 0.3692993846643897,
          "ci_lower": 0.3488812806449223,
          "ci_upper": 0.39068700634794734
        },
        "macro_f1": {
          "value": 0.5771847376894302,
          "ci_lower": 0.5651672658050325,
          "ci_upper": 0.5882011577352902
        },
        "balanced_accuracy": {
          "value": 0.5831170970357266,
          "ci_lower": 0.5700931869499836,
          "ci_upper": 0.5947456506542858
        },
        "brier_score": {
          "value": 0.2095984075010389,
          "ci_lower": 0.20497906047830855,
          "ci_upper": 0.21216905333322159
        },
        "log_loss": {
          "value": 0.6089106023772566,
          "ci_lower": 0.598185225461413,
          "ci_upper": 0.6152398985938232
        }
      },
      "brier_score": 0.2095984075010389,
      "log_loss": 0.6089106023772566,
      "calibration_curve": {
        "prob_pred": [
          0.06146078869831144,
          0.15826879150645679,
          0.2539651087319646,
          0.34891303970700216,
          0.4502273471974536,
          0.544823855918071,
          0.6430414823913261,
          0.7431005417491516,
          0.8529413968324662,
          0.9191212437369607
        ],
        "prob_true": [
          0.11578947368421053,
          0.14728682170542637,
          0.17463352453792225,
          0.21523809523809523,
          0.2596685082872928,
          0.29296591733139954,
          0.38980263157894735,
          0.43891402714932126,
          0.6285714285714286,
          0.5454545454545454
        ]
      }
    }
  },
  "model_perf": [
    {
      "task": "Task A (Occurrence)",
      "model": "Prior Baseline",
      "val_roc_auc": "0.5",
      "val_macro_f1": "0.4444",
      "test_roc_auc_95ci": "0.500 [0.500, 0.500]",
      "test_pr_auc_95ci": "0.200 [0.196, 0.204]",
      "test_macro_f1_95ci": "0.444 [0.443, 0.446]",
      "test_brier_score": "0.16",
      "test_log_loss": "0.5004"
    },
    {
      "task": "Task A (Occurrence)",
      "model": "Logistic Regression",
      "val_roc_auc": "0.6692",
      "val_macro_f1": "0.5179",
      "test_roc_auc_95ci": "0.669 [0.663, 0.674]",
      "test_pr_auc_95ci": "0.300 [0.292, 0.309]",
      "test_macro_f1_95ci": "0.518 [0.513, 0.522]",
      "test_brier_score": "0.2289",
      "test_log_loss": "0.6432"
    },
    {
      "task": "Task A (Occurrence)",
      "model": "Random Forest",
      "val_roc_auc": "0.6833",
      "val_macro_f1": "0.5524",
      "test_roc_auc_95ci": "0.683 [0.677, 0.688]",
      "test_pr_auc_95ci": "0.312 [0.303, 0.321]",
      "test_macro_f1_95ci": "0.551 [0.547, 0.556]",
      "test_brier_score": "0.2108",
      "test_log_loss": "0.5994"
    },
    {
      "task": "Task A (Occurrence)",
      "model": "XGBoost",
      "val_roc_auc": "0.6825",
      "val_macro_f1": "0.4469",
      "test_roc_auc_95ci": "0.682 [0.676, 0.688]",
      "test_pr_auc_95ci": "0.307 [0.301, 0.316]",
      "test_macro_f1_95ci": "0.446 [0.444, 0.448]",
      "test_brier_score": "0.15",
      "test_log_loss": "0.465"
    },
    {
      "task": "Task B (Severity KSI)",
      "model": "Prior Baseline",
      "val_roc_auc": "0.5",
      "val_macro_f1": "0.431",
      "test_roc_auc_95ci": "0.500 [0.500, 0.500]",
      "test_pr_auc_95ci": "0.248 [0.238, 0.257]",
      "test_macro_f1_95ci": "0.429 [0.426, 0.432]",
      "test_brier_score": "0.187",
      "test_log_loss": "0.5616"
    },
    {
      "task": "Task B (Severity KSI)",
      "model": "Logistic Regression",
      "val_roc_auc": "0.6166",
      "val_macro_f1": "0.5473",
      "test_roc_auc_95ci": "0.614 [0.603, 0.630]",
      "test_pr_auc_95ci": "0.355 [0.334, 0.380]",
      "test_macro_f1_95ci": "0.550 [0.539, 0.562]",
      "test_brier_score": "0.2363",
      "test_log_loss": "0.6657"
    },
    {
      "task": "Task B (Severity KSI)",
      "model": "Random Forest",
      "val_roc_auc": "0.6492",
      "val_macro_f1": "0.5753",
      "test_roc_auc_95ci": "0.628 [0.614, 0.641]",
      "test_pr_auc_95ci": "0.366 [0.345, 0.388]",
      "test_macro_f1_95ci": "0.576 [0.565, 0.588]",
      "test_brier_score": "0.2056",
      "test_log_loss": "0.5997"
    },
    {
      "task": "Task B (Severity KSI)",
      "model": "XGBoost",
      "val_roc_auc": "0.649",
      "val_macro_f1": "0.5843",
      "test_roc_auc_95ci": "0.629 [0.617, 0.643]",
      "test_pr_auc_95ci": "0.369 [0.349, 0.391]",
      "test_macro_f1_95ci": "0.577 [0.565, 0.588]",
      "test_brier_score": "0.2096",
      "test_log_loss": "0.6089"
    }
  ],
  "stability": [
    {
      "regime_a": "rain",
      "regime_b": "clear",
      "model": "XGBoost",
      "protocol": "P1 (Global Model Sliced)",
      "metric": "cosine_distance",
      "value": "0.0001",
      "ci_low": "0.0",
      "ci_high": "0.0001",
      "noise_floor": "0.0",
      "ESR": "2.429",
      "p_value": "0.858",
      "effect_size": "-0.819",
      "survives_shift_control": "True",
      "p_holm": "1.0"
    },
    {
      "regime_a": "high_wind",
      "regime_b": "clear",
      "model": "XGBoost",
      "protocol": "P1 (Global Model Sliced)",
      "metric": "cosine_distance",
      "value": "0.0",
      "ci_low": "0.0",
      "ci_high": "0.0001",
      "noise_floor": "0.0",
      "ESR": "1.454",
      "p_value": "0.683",
      "effect_size": "-0.554",
      "survives_shift_control": "True",
      "p_holm": "1.0"
    },
    {
      "regime_a": "fog",
      "regime_b": "clear",
      "model": "XGBoost",
      "protocol": "P1 (Global Model Sliced)",
      "metric": "cosine_distance",
      "value": "0.0001",
      "ci_low": "0.0001",
      "ci_high": "0.0001",
      "noise_floor": "0.0",
      "ESR": "5.214",
      "p_value": "0.684",
      "effect_size": "-0.554",
      "survives_shift_control": "True",
      "p_holm": "1.0"
    },
    {
      "regime_a": "rain",
      "regime_b": "high_wind",
      "model": "XGBoost",
      "protocol": "P1 (Global Model Sliced)",
      "metric": "cosine_distance",
      "value": "0.0",
      "ci_low": "0.0",
      "ci_high": "0.0001",
      "noise_floor": "0.0",
      "ESR": "1.998",
      "p_value": "0.961",
      "effect_size": "-0.964",
      "survives_shift_control": "True",
      "p_holm": "1.0"
    },
    {
      "regime_a": "rain",
      "regime_b": "clear",
      "model": "XGBoost",
      "protocol": "P2 (Per-Regime Models)",
      "metric": "cosine_distance",
      "value": "0.0602",
      "ci_low": "0.0602",
      "ci_high": "0.0602",
      "noise_floor": "0.0",
      "ESR": "2485.689",
      "p_value": "0.001",
      "effect_size": "5331.202",
      "survives_shift_control": "True",
      "p_holm": "0.001"
    }
  ],
  "family_shares": [
    {
      "Weather": "14.41135539618651",
      "Road": "5.603866777562",
      "Traffic": "42.80206624248315",
      "Time/Light": "37.18271048525914",
      "regime": "clear",
      "model": "XGBoost",
      "sample_count": "6889"
    },
    {
      "Weather": "14.511951408842014",
      "Road": "5.582906021787595",
      "Traffic": "42.95245166396421",
      "Time/Light": "36.952693392718885",
      "regime": "fog",
      "model": "XGBoost",
      "sample_count": "442"
    },
    {
      "Weather": "14.311658929552609",
      "Road": "5.683325964200051",
      "Traffic": "42.56177246762364",
      "Time/Light": "37.443242118120665",
      "regime": "high_wind",
      "model": "XGBoost",
      "sample_count": "1984"
    },
    {
      "Weather": "14.615516517273589",
      "Road": "5.467800902084985",
      "Traffic": "42.54538401418376",
      "Time/Light": "37.37129486876868",
      "regime": "rain",
      "model": "XGBoost",
      "sample_count": "685"
    }
  ],
  "leakage_audit": [
    {
      "feature_name": "traffic_flow_hourly_est",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "DfT AADF x Diurnal Profile",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "aadf_hgv_share",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "DfT AADF Count Point",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "speed_limit",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Sampled Road Segment Context",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "road_type",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Sampled Road Segment Context",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "junction_detail",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Sampled Road Segment Context",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "urban_or_rural_area",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Sampled Road Segment Context",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "hour",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Timestamp UTC",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "day_of_week",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Timestamp UTC",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "month",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Timestamp UTC",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "is_weekend",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Timestamp UTC",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "is_bank_holiday",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "UK Official Bank Holidays",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "solar_elevation_deg",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Astral Astronomical Calculation",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "temperature_2m",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Grid",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "precipitation",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Grid",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "rolling_3h_precip",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Rolling 3h",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "rolling_24h_precip",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Rolling 24h",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "wind_gusts_10m",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Grid",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "is_freezing",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Threshold",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "fog_proxy",
      "available_for_cases": "Yes",
      "available_for_controls": "Yes",
      "source": "Open-Meteo ERA5 Fog Algorithm",
      "identically_constructed": "Yes",
      "leakage_verdict": "SAFE"
    },
    {
      "feature_name": "weather_conditions",
      "available_for_cases": "Yes (Police)",
      "available_for_controls": "No",
      "source": "STATS19 Subjective Field",
      "identically_constructed": "No",
      "leakage_verdict": "EXCLUDED (LEAKAGE)"
    },
    {
      "feature_name": "light_conditions",
      "available_for_cases": "Yes (Police)",
      "available_for_controls": "No",
      "source": "STATS19 Subjective Field",
      "identically_constructed": "No",
      "leakage_verdict": "EXCLUDED (LEAKAGE)"
    },
    {
      "feature_name": "road_surface_conditions",
      "available_for_cases": "Yes (Police)",
      "available_for_controls": "No",
      "source": "STATS19 Subjective Field",
      "identically_constructed": "No",
      "leakage_verdict": "EXCLUDED (LEAKAGE)"
    },
    {
      "feature_name": "number_of_vehicles",
      "available_for_cases": "Yes (Collision)",
      "available_for_controls": "No",
      "source": "STATS19 Collision Record",
      "identically_constructed": "No",
      "leakage_verdict": "EXCLUDED (LEAKAGE)"
    },
    {
      "feature_name": "number_of_casualties",
      "available_for_cases": "Yes (Collision)",
      "available_for_controls": "No",
      "source": "STATS19 Collision Record",
      "identically_constructed": "No",
      "leakage_verdict": "EXCLUDED (LEAKAGE)"
    }
  ],
  "data_inventory": [
    {
      "dataset_name": "STATS19 Collisions 2021",
      "source": "UK Department for Transport (OGL v3.0)",
      "total_rows": "101087",
      "total_columns": "44",
      "date_range": "10/02/2021 to 18/08/2021",
      "missingness_pct": "0.0"
    },
    {
      "dataset_name": "STATS19 Collisions 2022",
      "source": "UK Department for Transport (OGL v3.0)",
      "total_rows": "106004",
      "total_columns": "44",
      "date_range": "23/09/2022 to 30/04/2022",
      "missingness_pct": "0.0"
    },
    {
      "dataset_name": "STATS19 Collisions 2023",
      "source": "UK Department for Transport (OGL v3.0)",
      "total_rows": "104258",
      "total_columns": "44",
      "date_range": "04/03/2023 to 27/12/2023",
      "missingness_pct": "0.0"
    },
    {
      "dataset_name": "STATS19 Collisions 2024",
      "source": "UK Department for Transport (OGL v3.0)",
      "total_rows": "100927",
      "total_columns": "44",
      "date_range": "12/01/2024 to 27/07/2024",
      "missingness_pct": "0.0"
    },
    {
      "dataset_name": "DfT Road Traffic Counts (AADF)",
      "source": "UK Department for Transport",
      "total_rows": "20000",
      "total_columns": "34",
      "date_range": "2000 - 2024",
      "missingness_pct": "0.0"
    }
  ],
  "xgb_importance": [
    {
      "feature": "traffic_flow_hourly_est",
      "mean_abs_shap": "0.5419807",
      "mean_signed_shap": "-0.14365198",
      "family": "Traffic",
      "normalized_share": "0.4274397",
      "rank": "1"
    },
    {
      "feature": "hour",
      "mean_abs_shap": "0.13309851",
      "mean_signed_shap": "-0.034007628",
      "family": "Time/Light",
      "normalized_share": "0.10496977",
      "rank": "2"
    },
    {
      "feature": "solar_elevation_deg",
      "mean_abs_shap": "0.12363226",
      "mean_signed_shap": "0.0002171005",
      "family": "Time/Light",
      "normalized_share": "0.097504094",
      "rank": "3"
    },
    {
      "feature": "hour_of_week",
      "mean_abs_shap": "0.07690622",
      "mean_signed_shap": "-0.008349392",
      "family": "Time/Light",
      "normalized_share": "0.060653027",
      "rank": "4"
    },
    {
      "feature": "day_of_week",
      "mean_abs_shap": "0.06677062",
      "mean_signed_shap": "-0.009526889",
      "family": "Time/Light",
      "normalized_share": "0.052659467",
      "rank": "5"
    },
    {
      "feature": "month",
      "mean_abs_shap": "0.06172787",
      "mean_signed_shap": "-0.003070428",
      "family": "Time/Light",
      "normalized_share": "0.04868244",
      "rank": "6"
    },
    {
      "feature": "temperature_2m",
      "mean_abs_shap": "0.049525607",
      "mean_signed_shap": "-0.0069254874",
      "family": "Weather",
      "normalized_share": "0.039058976",
      "rank": "7"
    },
    {
      "feature": "wind_gusts_10m",
      "mean_abs_shap": "0.04664763",
      "mean_signed_shap": "-0.0015474998",
      "family": "Weather",
      "normalized_share": "0.036789224",
      "rank": "8"
    },
    {
      "feature": "rolling_24h_precip",
      "mean_abs_shap": "0.035451736",
      "mean_signed_shap": "-0.0066457917",
      "family": "Weather",
      "normalized_share": "0.027959445",
      "rank": "9"
    },
    {
      "feature": "junction_detail",
      "mean_abs_shap": "0.027283775",
      "mean_signed_shap": "-0.0031237884",
      "family": "Road",
      "normalized_share": "0.021517683",
      "rank": "10"
    },
    {
      "feature": "rolling_3h_precip",
      "mean_abs_shap": "0.024324581",
      "mean_signed_shap": "0.00040420526",
      "family": "Weather",
      "normalized_share": "0.019183878",
      "rank": "11"
    },
    {
      "feature": "speed_limit",
      "mean_abs_shap": "0.022140564",
      "mean_signed_shap": "-0.001352683",
      "family": "Road",
      "normalized_share": "0.017461427",
      "rank": "12"
    },
    {
      "feature": "precipitation",
      "mean_abs_shap": "0.018046029",
      "mean_signed_shap": "-0.0036104287",
      "family": "Weather",
      "normalized_share": "0.014232221",
      "rank": "13"
    },
    {
      "feature": "urban_or_rural_area",
      "mean_abs_shap": "0.012411595",
      "mean_signed_shap": "-0.0013755489",
      "family": "Road",
      "normalized_share": "0.009788556",
      "rank": "14"
    },
    {
      "feature": "is_bank_holiday",
      "mean_abs_shap": "0.010012578",
      "mean_signed_shap": "0.0019300146",
      "family": "Time/Light",
      "normalized_share": "0.007896543",
      "rank": "15"
    },
    {
      "feature": "road_type",
      "mean_abs_shap": "0.009286542",
      "mean_signed_shap": "0.0005654317",
      "family": "Road",
      "normalized_share": "0.007323945",
      "rank": "16"
    },
    {
      "feature": "fog_proxy",
      "mean_abs_shap": "0.008723158",
      "mean_signed_shap": "-0.00094534695",
      "family": "Weather",
      "normalized_share": "0.0068796254",
      "rank": "17"
    },
    {
      "feature": "light_regime",
      "mean_abs_shap": "0.0",
      "mean_signed_shap": "0.0",
      "family": "Time/Light",
      "normalized_share": "0.0",
      "rank": "18"
    },
    {
      "feature": "is_weekend",
      "mean_abs_shap": "0.0",
      "mean_signed_shap": "0.0",
      "family": "Time/Light",
      "normalized_share": "0.0",
      "rank": "19"
    },
    {
      "feature": "is_freezing",
      "mean_abs_shap": "0.0",
      "mean_signed_shap": "0.0",
      "family": "Weather",
      "normalized_share": "0.0",
      "rank": "20"
    }
  ],
  "rf_importance": [
    {
      "feature": "traffic_flow_hourly_est",
      "mean_abs_shap": "0.06724619713383516",
      "mean_signed_shap": "-0.01424618990487532",
      "family": "Traffic",
      "normalized_share": "0.2785708757821811",
      "rank": "1"
    },
    {
      "feature": "hour",
      "mean_abs_shap": "0.04942227555612784",
      "mean_signed_shap": "-0.009436931519855663",
      "family": "Time/Light",
      "normalized_share": "0.2047343518536544",
      "rank": "2"
    },
    {
      "feature": "solar_elevation_deg",
      "mean_abs_shap": "0.02924919537945478",
      "mean_signed_shap": "-0.010750075204569587",
      "family": "Time/Light",
      "normalized_share": "0.12116631601579683",
      "rank": "3"
    },
    {
      "feature": "light_regime",
      "mean_abs_shap": "0.012961680051799662",
      "mean_signed_shap": "0.0007003557408781578",
      "family": "Time/Light",
      "normalized_share": "0.05369443503923434",
      "rank": "4"
    },
    {
      "feature": "hour_of_week",
      "mean_abs_shap": "0.011968228183184083",
      "mean_signed_shap": "-0.005928429429954325",
      "family": "Time/Light",
      "normalized_share": "0.0495790089053684",
      "rank": "5"
    },
    {
      "feature": "day_of_week",
      "mean_abs_shap": "0.010165523073372885",
      "mean_signed_shap": "-0.0002653076653567496",
      "family": "Time/Light",
      "normalized_share": "0.04211120905019348",
      "rank": "6"
    },
    {
      "feature": "month",
      "mean_abs_shap": "0.010048364890404397",
      "mean_signed_shap": "-0.0033896706622407167",
      "family": "Time/Light",
      "normalized_share": "0.041625875172210364",
      "rank": "7"
    },
    {
      "feature": "temperature_2m",
      "mean_abs_shap": "0.008956721572639681",
      "mean_signed_shap": "-0.004721213799613873",
      "family": "Weather",
      "normalized_share": "0.03710368584355205",
      "rank": "8"
    },
    {
      "feature": "is_weekend",
      "mean_abs_shap": "0.007762374666854978",
      "mean_signed_shap": "-0.0001058970719282051",
      "family": "Time/Light",
      "normalized_share": "0.03215604154970427",
      "rank": "9"
    },
    {
      "feature": "rolling_24h_precip",
      "mean_abs_shap": "0.006865000000589194",
      "mean_signed_shap": "-0.0052059357071693275",
      "family": "Weather",
      "normalized_share": "0.02843862023309241",
      "rank": "10"
    },
    {
      "feature": "wind_gusts_10m",
      "mean_abs_shap": "0.006151606972630445",
      "mean_signed_shap": "-0.0054027810349642266",
      "family": "Weather",
      "normalized_share": "0.025483352440330065",
      "rank": "11"
    },
    {
      "feature": "junction_detail",
      "mean_abs_shap": "0.004442156453920785",
      "mean_signed_shap": "-0.002287342236861582",
      "family": "Road",
      "normalized_share": "0.0184018645882289",
      "rank": "12"
    },
    {
      "feature": "rolling_3h_precip",
      "mean_abs_shap": "0.00316119271277356",
      "mean_signed_shap": "-0.002298620856384368",
      "family": "Weather",
      "normalized_share": "0.013095405540345334",
      "rank": "13"
    },
    {
      "feature": "speed_limit",
      "mean_abs_shap": "0.002949891801056053",
      "mean_signed_shap": "-0.0019774506357533132",
      "family": "Road",
      "normalized_share": "0.012220080502803508",
      "rank": "14"
    },
    {
      "feature": "fog_proxy",
      "mean_abs_shap": "0.0022646246367119863",
      "mean_signed_shap": "-7.737984641114364e-05",
      "family": "Weather",
      "normalized_share": "0.009381325565685305",
      "rank": "15"
    },
    {
      "feature": "precipitation",
      "mean_abs_shap": "0.0020028968981065836",
      "mean_signed_shap": "-0.0014028091400807045",
      "family": "Weather",
      "normalized_share": "0.008297104770051467",
      "rank": "16"
    },
    {
      "feature": "road_type",
      "mean_abs_shap": "0.0019486787904513696",
      "mean_signed_shap": "-0.0015065935028770862",
      "family": "Road",
      "normalized_share": "0.00807250343381968",
      "rank": "17"
    },
    {
      "feature": "urban_or_rural_area",
      "mean_abs_shap": "0.0018199157292970959",
      "mean_signed_shap": "-0.0008823630984181309",
      "family": "Road",
      "normalized_share": "0.0075390957432293565",
      "rank": "18"
    },
    {
      "feature": "is_bank_holiday",
      "mean_abs_shap": "0.0016821913916253077",
      "mean_signed_shap": "0.00017010344025562236",
      "family": "Time/Light",
      "normalized_share": "0.006968565497698983",
      "rank": "19"
    },
    {
      "feature": "is_freezing",
      "mean_abs_shap": "0.00032836822251457333",
      "mean_signed_shap": "-2.7660194906434226e-05",
      "family": "Weather",
      "normalized_share": "0.001360282472819529",
      "rank": "20"
    }
  ],
  "waterfall_cases": {
    "typical_high_risk_tp": {
      "index": 5977,
      "prob": 0.5839425325393677,
      "true_label": 1,
      "shap": [
        -0.29651445150375366,
        0.00592337129637599,
        -0.002674565650522709,
        -0.011834854260087013,
        0.005184294655919075,
        0.04839276149868965,
        -0.09315921366214752,
        -0.23324714601039886,
        0.13685745000839233,
        0.0,
        0.004793273285031319,
        -0.2740446925163269,
        0.0,
        -0.04238917678594589,
        0.007855729199945927,
        -0.008408726193010807,
        -0.01651775650680065,
        -0.03344222903251648,
        0.0,
        0.005749183241277933
      ],
      "inputs": {
        "traffic_flow_hourly_est": 18287.76333482743,
        "speed_limit": 50.0,
        "road_type": 3.0,
        "junction_detail": 0.0,
        "urban_or_rural_area": 2.0,
        "hour": 17.0,
        "day_of_week": 1.0,
        "hour_of_week": 41.0,
        "month": 11.0,
        "is_weekend": 0.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": -8.39089645394911,
        "light_regime": 1.0,
        "temperature_2m": 0.5,
        "precipitation": 0.0,
        "rolling_3h_precip": 0.0,
        "rolling_24h_precip": 16.400000000000002,
        "wind_gusts_10m": 25.6,
        "is_freezing": 0.0,
        "fog_proxy": 0.0
      }
    },
    "typical_low_risk_tn": {
      "index": 9959,
      "prob": 0.008033104240894318,
      "true_label": 0,
      "shap": [
        0.5039085149765015,
        0.009467423893511295,
        -0.002966265892609954,
        -0.005914483219385147,
        -0.02455877885222435,
        0.05190989747643471,
        0.06336477398872375,
        -0.03818637132644653,
        -0.1733955293893814,
        0.0,
        0.008641500025987625,
        -0.02837289124727249,
        0.0,
        -0.007717065513134003,
        -0.011316952295601368,
        -9.418391709914431e-05,
        -0.07309971749782562,
        -0.04927414283156395,
        0.0,
        0.004314562305808067
      ],
      "inputs": {
        "traffic_flow_hourly_est": 860.6006275212909,
        "speed_limit": 30.0,
        "road_type": 3.0,
        "junction_detail": 16.0,
        "urban_or_rural_area": 1.0,
        "hour": 3.0,
        "day_of_week": 1.0,
        "hour_of_week": 27.0,
        "month": 1.0,
        "is_weekend": 0.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": -38.98091681277995,
        "light_regime": 1.0,
        "temperature_2m": 1.0,
        "precipitation": 0.1,
        "rolling_3h_precip": 0.100000000000004,
        "rolling_24h_precip": 0.1,
        "wind_gusts_10m": 18.0,
        "is_freezing": 0.0,
        "fog_proxy": 0.0
      }
    },
    "borderline_case": {
      "index": 5069,
      "prob": 0.5009679794311523,
      "true_label": 1,
      "shap": [
        0.18786738812923431,
        0.022893210873007774,
        -0.009195446036756039,
        0.00018984745838679373,
        -0.006536052096635103,
        0.08642308413982391,
        0.03622129186987877,
        0.01572023518383503,
        0.06730802357196808,
        0.0,
        0.005067352205514908,
        -0.07384997606277466,
        0.0,
        -0.005275328643620014,
        0.006684743799269199,
        -0.010316071100533009,
        0.02503173239529133,
        -0.07021971791982651,
        0.0,
        -0.10629504919052124
      ],
      "inputs": {
        "traffic_flow_hourly_est": 17212.012550425818,
        "speed_limit": 40.0,
        "road_type": 6.0,
        "junction_detail": 0.0,
        "urban_or_rural_area": 2.0,
        "hour": 15.0,
        "day_of_week": 3.0,
        "hour_of_week": 87.0,
        "month": 11.0,
        "is_weekend": 0.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": 4.716194590970389,
        "light_regime": 0.0,
        "temperature_2m": 1.7,
        "precipitation": 0.0,
        "rolling_3h_precip": 0.0,
        "rolling_24h_precip": 0.0,
        "wind_gusts_10m": 14.0,
        "is_freezing": 0.0,
        "fog_proxy": 0.0
      }
    },
    "hard_false_positive": {
      "index": 9905,
      "prob": 0.5014910101890564,
      "true_label": 0,
      "shap": [
        0.339594304561615,
        0.023017965257167816,
        0.020868580788373947,
        0.004600441083312035,
        0.012380560860037804,
        -0.0212510097771883,
        -0.05923720449209213,
        0.07913831621408463,
        0.02118813432753086,
        0.0,
        0.004345643799751997,
        0.28750142455101013,
        0.0,
        -0.08110807090997696,
        0.006416449788957834,
        -0.017114214599132538,
        0.023267248645424843,
        0.022295529022812843,
        0.0,
        0.003230562899261713
      ],
      "inputs": {
        "traffic_flow_hourly_est": 18825.638727028236,
        "speed_limit": 30.0,
        "road_type": 6.0,
        "junction_detail": 0.0,
        "urban_or_rural_area": 1.0,
        "hour": 16.0,
        "day_of_week": 2.0,
        "hour_of_week": 64.0,
        "month": 5.0,
        "is_weekend": 0.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": 28.5316611249535,
        "light_regime": 0.0,
        "temperature_2m": 13.8,
        "precipitation": 3.8,
        "rolling_3h_precip": 10.900000000000004,
        "rolling_24h_precip": 36.0,
        "wind_gusts_10m": 43.6,
        "is_freezing": 0.0,
        "fog_proxy": 0.0
      }
    },
    "hard_false_negative": {
      "index": 417,
      "prob": 0.010440049692988396,
      "true_label": 1,
      "shap": [
        0.41669750213623047,
        -0.016866719350218773,
        -0.007568997796624899,
        -0.002936314092949033,
        -0.017839275300502777,
        -0.1558636724948883,
        0.09906954318284988,
        0.062306057661771774,
        0.12032238394021988,
        0.0,
        0.011194070801138878,
        0.10336378961801529,
        0.0,
        0.06060069799423218,
        -0.07599355280399323,
        -0.025738604366779327,
        -0.12788280844688416,
        -0.009424782358109951,
        0.0,
        0.004517219960689545
      ],
      "inputs": {
        "traffic_flow_hourly_est": 860.6006275212909,
        "speed_limit": 30.0,
        "road_type": 3.0,
        "junction_detail": 13.0,
        "urban_or_rural_area": 1.0,
        "hour": 2.0,
        "day_of_week": 2.0,
        "hour_of_week": 50.0,
        "month": 1.0,
        "is_weekend": 0.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": -45.52669843332981,
        "light_regime": 1.0,
        "temperature_2m": 1.8,
        "precipitation": 0.1,
        "rolling_3h_precip": 1.499999999999994,
        "rolling_24h_precip": 4.7,
        "wind_gusts_10m": 15.1,
        "is_freezing": 0.0,
        "fog_proxy": 1.0
      }
    },
    "extreme_weather_case": {
      "index": 5670,
      "prob": 0.32266560196876526,
      "true_label": 1,
      "shap": [
        -1.676936149597168,
        -0.03140837326645851,
        -0.0035724984481930733,
        -0.1430683583021164,
        0.011305825784802437,
        -0.17092187702655792,
        -0.08878499269485474,
        -0.1862432211637497,
        -0.019035153090953827,
        0.0,
        -0.003019005060195923,
        -0.1737186461687088,
        0.0,
        0.008736460469663143,
        0.006082527805119753,
        0.012380370870232582,
        0.011612394824624062,
        -0.0809490904211998,
        0.0,
        0.00594572676345706
      ],
      "inputs": {
        "traffic_flow_hourly_est": 18825.638727028236,
        "speed_limit": 30.0,
        "road_type": 3.0,
        "junction_detail": 13.0,
        "urban_or_rural_area": 1.0,
        "hour": 16.0,
        "day_of_week": 5.0,
        "hour_of_week": 136.0,
        "month": 12.0,
        "is_weekend": 1.0,
        "is_bank_holiday": 0.0,
        "solar_elevation_deg": -7.931977151460245,
        "light_regime": 1.0,
        "temperature_2m": 5.4,
        "precipitation": 1.1,
        "rolling_3h_precip": 3.8000000000000087,
        "rolling_24h_precip": 17.8,
        "wind_gusts_10m": 95.0,
        "is_freezing": 0.0,
        "fog_proxy": 0.0
      }
    }
  },
  "pdp_ale": {
    "traffic_flow_hourly_est": {
      "pdp": [
        0.06207842142600566,
        0.07216271766088903,
        0.0997432923335582,
        0.11073416160047055,
        0.1128504809513688,
        0.16995510694384575,
        0.16995510694384575,
        0.16995510694384575,
        0.19373513785749674,
        0.19373513785749674,
        0.19255712760612367,
        0.19600392439588904,
        0.19600392439588904,
        0.19600392439588904,
        0.22051765506714582,
        0.22051765506714582,
        0.22051765506714582,
        0.2281265320777893,
        0.2277023021504283,
        0.26766678007692096,
        0.27865521277487276,
        0.27865521277487276,
        0.28273434719070795,
        0.2838793365061283,
        0.28740184525400403
      ],
      "pdp_grid": [
        860.6006275212909,
        1609.1438816674136,
        2357.6871358135363,
        3106.230389959659,
        3854.773644105782,
        4603.316898251905,
        5351.860152398028,
        6100.40340654415,
        6848.946660690273,
        7597.489914836397,
        8346.033168982518,
        9094.576423128641,
        9843.119677274764,
        10591.662931420888,
        11340.206185567009,
        12088.749439713132,
        12837.292693859255,
        13585.835948005379,
        14334.379202151502,
        15082.922456297623,
        15831.465710443747,
        16580.00896458987,
        17328.55221873599,
        18077.095472882113,
        18825.638727028236
      ],
      "ale": [
        -0.14539419128956194,
        -0.09347028299631471,
        -0.07563657327951784,
        -0.0652850877067625,
        -0.019474771948772618,
        -0.012079941718149134,
        -0.012762301395888576,
        0.01844905244255518,
        0.020709426813517562,
        0.0337655374042139,
        0.03686023687081491,
        0.03820344663294112,
        0.04170893991435026,
        0.041249701784216664
      ],
      "ale_grid": [
        1237.1134020618556,
        2958.314657104437,
        5378.753922008067,
        7530.255490811294,
        9950.694755714925,
        12371.134020618556,
        13715.822501120572,
        14253.69789332138,
        14791.573285522187,
        15329.448677722992,
        16405.199462124605,
        17480.95024652622,
        18018.825638727027,
        18556.701030927834
      ],
      "l2_distance": 0.017903041961547968,
      "sign_change": false
    },
    "speed_limit": {
      "pdp": [
        0.23723413524776696,
        0.23723413524776696,
        0.23723413524776696,
        0.23723413524776696,
        0.23723413524776696,
        0.2393399358075112,
        0.2393399358075112,
        0.2393399358075112,
        0.2393399358075112,
        0.2393399358075112,
        0.23995486104302108,
        0.23995486104302108,
        0.23995486104302108,
        0.23995486104302108,
        0.23995486104302108,
        0.2423951432593167,
        0.2423951432593167,
        0.2423951432593167,
        0.2423951432593167,
        0.2423951432593167,
        0.2375779763655737,
        0.2375779763655737,
        0.2375779763655737,
        0.2375779763655737,
        0.23650434114970267
      ],
      "pdp_grid": [
        20.0,
        22.083333333333332,
        24.166666666666668,
        26.25,
        28.333333333333336,
        30.416666666666668,
        32.5,
        34.583333333333336,
        36.66666666666667,
        38.75,
        40.833333333333336,
        42.91666666666667,
        45.0,
        47.083333333333336,
        49.16666666666667,
        51.25,
        53.333333333333336,
        55.41666666666667,
        57.5,
        59.583333333333336,
        61.66666666666667,
        63.75,
        65.83333333333334,
        67.91666666666667,
        70.0
      ],
      "ale": [
        0.00011602873165786625,
        0.00012242763260831018,
        0.0022532298877321636,
        -0.0011905523300684534,
        -0.0013950067390270076
      ],
      "ale_grid": [
        25.0,
        35.0,
        45.0,
        55.0,
        65.0
      ],
      "l2_distance": 0.0019516247620475075,
      "sign_change": true
    },
    "precipitation": {
      "pdp": [
        0.24059889357257636,
        0.24059889357257636,
        0.23172642800025642,
        0.23446223276667297,
        0.233453948026523,
        0.23427434439584613,
        0.23427441621758044,
        0.23487087701447307,
        0.23377161076851188,
        0.23977886986732483,
        0.25094845464639365,
        0.25347743612900375,
        0.25347208182886244,
        0.2530531644113362,
        0.24863619563356043,
        0.25209591718390584,
        0.24816022486798464,
        0.25265568496473134,
        0.25096222064457835,
        0.2538976087067276,
        0.2506405713967979,
        0.25061163879558446,
        0.25061163879558446,
        0.2506610694043338,
        0.2506610694043338
      ],
      "pdp_grid": [
        0.0,
        0.09595833333333322,
        0.19191666666666643,
        0.28787499999999966,
        0.38383333333333286,
        0.47979166666666606,
        0.5757499999999993,
        0.6717083333333325,
        0.7676666666666657,
        0.863624999999999,
        0.9595833333333321,
        1.0555416666666653,
        1.1514999999999986,
        1.2474583333333318,
        1.343416666666665,
        1.4393749999999983,
        1.5353333333333314,
        1.6312916666666646,
        1.727249999999998,
        1.823208333333331,
        1.9191666666666642,
        2.0151249999999976,
        2.1110833333333305,
        2.207041666666664,
        2.3029999999999973
      ],
      "ale": [
        -0.001380243484854984,
        0.002166424731731129,
        0.0014601052091528597,
        0.015666525839369456
      ],
      "ale_grid": [
        0.05,
        0.15000000000000002,
        0.35,
        1.0
      ],
      "l2_distance": 0.005380401387831883,
      "sign_change": false
    },
    "temperature_2m": {
      "pdp": [
        0.19463083400391043,
        0.20301446724310518,
        0.19356045488733797,
        0.20951076364330948,
        0.2314589838469401,
        0.2396978475926444,
        0.23221494351048022,
        0.23459171854890884,
        0.23762074921280146,
        0.24192214514315127,
        0.2380415019337088,
        0.23846233672089875,
        0.24104513385891915,
        0.23575005991756917,
        0.23096238624304533,
        0.23096497047878803,
        0.24077060944028197,
        0.24051209785416722,
        0.24175561944954096,
        0.24245060930773615,
        0.25096853770688177,
        0.24978391083143653,
        0.24760875588282943,
        0.24812662179023026,
        0.25015315890032797
      ],
      "pdp_grid": [
        -1.003,
        0.051416666666666666,
        1.1058333333333332,
        2.1602499999999996,
        3.214666666666666,
        4.269083333333333,
        5.323499999999999,
        6.377916666666666,
        7.432333333333332,
        8.486749999999999,
        9.541166666666665,
        10.595583333333332,
        11.649999999999999,
        12.704416666666665,
        13.758833333333332,
        14.813249999999998,
        15.867666666666665,
        16.922083333333333,
        17.976499999999998,
        19.030916666666663,
        20.08533333333333,
        21.13975,
        22.194166666666664,
        23.24858333333333,
        24.302999999999997
      ],
      "ale": [
        0.0031032755438095225,
        0.0024008245605832233,
        -0.005193481461345564,
        -0.0031484535496825086,
        0.0004251433934873237,
        -0.0004134702097767697,
        -0.0024029947884523974,
        -0.0026811100900782005,
        0.005979578906236802,
        -0.004024614615799274,
        -0.0023240280928699033,
        -0.006624555833139803,
        -0.007463612920572396,
        -0.0069759154060998665,
        0.001242881517656733,
        0.0003915610655999078,
        0.006462667596325864,
        0.0057402517928598715,
        0.008624514732774933,
        0.007673286011241962
      ],
      "ale_grid": [
        2.0,
        4.35,
        5.800000000000001,
        6.85,
        7.800000000000001,
        8.65,
        9.4,
        10.15,
        10.85,
        11.5,
        12.15,
        12.9,
        13.65,
        14.4,
        15.3,
        16.25,
        17.2,
        18.4,
        19.85,
        22.1
      ],
      "l2_distance": 0.015155322468180268,
      "sign_change": false
    }
  }
};
