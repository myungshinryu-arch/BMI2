/**
 * 한국타이어 상품 전략 분석 대시보드 - 데이터베이스 (data.js)
 * 북미 및 유럽 시장 점유율 분석을 위한 2021-2026 역사적 데이터셋.
 * 모든 타이어에 season 속성을 명시하여 횡비교 왜곡을 차단하고,
 * 2022-2023년 글로벌 공급망 마비 및 고금리에 따른 실질적인 경기 침체 판매량 감소 시나리오를 정교하게 반영.
 */

const TIRE_DATABASE = [
    // =============================================================
    // 1. 한국타이어 (Hankook Tire) - 전 세그먼트 배치 (독자 성장 시나리오)
    // =============================================================
    {
        brand: "Hankook",
        model: "Ventus S1 evo3",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 13.9, tirerack: { dry_traction: 9.1, wet_traction: 8.7, hydroplaning: 8.5, comfort: 8.4, noise: 8.2, treadwear: 7.8, user_rating: 8.5 }, consumerreports: { dry_braking: 90, wet_braking: 84, handling: 88, snow_traction: 30, ice_braking: 25, fuel_economy: 75, tread_life: 74, cr_overall: 80 } },
            "2022": { sales: 14.3, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.6, comfort: 8.4, noise: 8.2, treadwear: 7.8, user_rating: 8.6 }, consumerreports: { dry_braking: 91, wet_braking: 84, handling: 89, snow_traction: 31, ice_braking: 25, fuel_economy: 75, tread_life: 74, cr_overall: 81 } },
            "2023": { sales: 14.9, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 8.7, comfort: 8.5, noise: 8.3, treadwear: 7.9, user_rating: 8.7 }, consumerreports: { dry_braking: 92, wet_braking: 85, handling: 90, snow_traction: 32, ice_braking: 26, fuel_economy: 76, tread_life: 75, cr_overall: 83 } },
            "2024": { sales: 16.1, tirerack: { dry_traction: 9.3, wet_traction: 9.0, hydroplaning: 8.8, comfort: 8.6, noise: 8.4, treadwear: 8.0, user_rating: 8.8 }, consumerreports: { dry_braking: 92, wet_braking: 86, handling: 91, snow_traction: 33, ice_braking: 27, fuel_economy: 77, tread_life: 76, cr_overall: 85 } },
            "2025": { sales: 18.2, tirerack: { dry_traction: 9.3, wet_traction: 9.0, hydroplaning: 8.8, comfort: 8.6, noise: 8.4, treadwear: 8.0, user_rating: 8.8 }, consumerreports: { dry_braking: 93, wet_braking: 86, handling: 91, snow_traction: 33, ice_braking: 27, fuel_economy: 78, tread_life: 76, cr_overall: 86 } },
            "2026": { sales: 20.4, tirerack: { dry_traction: 9.4, wet_traction: 9.1, hydroplaning: 8.9, comfort: 8.7, noise: 8.5, treadwear: 8.1, user_rating: 8.9 }, consumerreports: { dry_braking: 94, wet_braking: 87, handling: 92, snow_traction: 34, ice_braking: 28, fuel_economy: 78, tread_life: 77, cr_overall: 88 } }
        }
    },
    {
        brand: "Hankook",
        model: "Ventus S1 AS",
        segment: "Ultra High Performance (UHP)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 10.6, tirerack: { dry_traction: 9.0, wet_traction: 8.5, hydroplaning: 8.4, comfort: 8.8, noise: 8.5, treadwear: 8.4, user_rating: 8.6 }, consumerreports: { dry_braking: 86, wet_braking: 82, handling: 86, snow_traction: 63, ice_braking: 53, fuel_economy: 79, tread_life: 80, cr_overall: 81 } },
            "2022": { sales: 10.0, tirerack: { dry_traction: 9.1, wet_traction: 8.6, hydroplaning: 8.5, comfort: 8.8, noise: 8.5, treadwear: 8.4, user_rating: 8.7 }, consumerreports: { dry_braking: 87, wet_braking: 83, handling: 87, snow_traction: 63, ice_braking: 53, fuel_economy: 79, tread_life: 80, cr_overall: 82 } },
            "2023": { sales: 10.5, tirerack: { dry_traction: 9.1, wet_traction: 8.6, hydroplaning: 8.5, comfort: 8.9, noise: 8.6, treadwear: 8.5, user_rating: 8.7 }, consumerreports: { dry_braking: 87, wet_braking: 83, handling: 87, snow_traction: 64, ice_braking: 54, fuel_economy: 80, tread_life: 81, cr_overall: 83 } },
            "2024": { sales: 11.6, tirerack: { dry_traction: 9.2, wet_traction: 8.7, hydroplaning: 8.6, comfort: 8.9, noise: 8.6, treadwear: 8.5, user_rating: 8.8 }, consumerreports: { dry_braking: 88, wet_braking: 84, handling: 88, snow_traction: 64, ice_braking: 54, fuel_economy: 80, tread_life: 81, cr_overall: 84 } },
            "2025": { sales: 13.1, tirerack: { dry_traction: 9.2, wet_traction: 8.8, hydroplaning: 8.7, comfort: 9.0, noise: 8.7, treadwear: 8.6, user_rating: 8.8 }, consumerreports: { dry_braking: 88, wet_braking: 84, handling: 88, snow_traction: 65, ice_braking: 55, fuel_economy: 81, tread_life: 82, cr_overall: 85 } },
            "2026": { sales: 15.0, tirerack: { dry_traction: 9.3, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.0, noise: 8.7, treadwear: 8.6, user_rating: 8.9 }, consumerreports: { dry_braking: 89, wet_braking: 85, handling: 89, snow_traction: 65, ice_braking: 55, fuel_economy: 81, tread_life: 82, cr_overall: 86 } }
        }
    },
    {
        brand: "Hankook",
        model: "Kinergy GT",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 18.8, tirerack: { dry_traction: 8.5, wet_traction: 8.1, hydroplaning: 8.2, comfort: 8.8, noise: 8.5, treadwear: 8.3, user_rating: 8.2 }, consumerreports: { dry_braking: 80, wet_braking: 78, handling: 79, snow_traction: 70, ice_braking: 58, fuel_economy: 82, tread_life: 82, cr_overall: 78 } },
            "2022": { sales: 18.4, tirerack: { dry_traction: 8.5, wet_traction: 8.2, hydroplaning: 8.3, comfort: 8.8, noise: 8.5, treadwear: 8.3, user_rating: 8.3 }, consumerreports: { dry_braking: 81, wet_braking: 78, handling: 79, snow_traction: 70, ice_braking: 58, fuel_economy: 82, tread_life: 82, cr_overall: 79 } }, // 금리 인상기 소폭 감소
            "2023": { sales: 18.8, tirerack: { dry_traction: 8.6, wet_traction: 8.3, hydroplaning: 8.4, comfort: 8.9, noise: 8.6, treadwear: 8.4, user_rating: 8.4 }, consumerreports: { dry_braking: 81, wet_braking: 79, handling: 80, snow_traction: 71, ice_braking: 59, fuel_economy: 83, tread_life: 83, cr_overall: 81 } },
            "2024": { sales: 20.4, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.5, comfort: 9.0, noise: 8.7, treadwear: 8.5, user_rating: 8.5 }, consumerreports: { dry_braking: 82, wet_braking: 80, handling: 81, snow_traction: 72, ice_braking: 60, fuel_economy: 84, tread_life: 84, cr_overall: 83 } },
            "2025": { sales: 22.1, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.5, comfort: 9.0, noise: 8.7, treadwear: 8.5, user_rating: 8.5 }, consumerreports: { dry_braking: 82, wet_braking: 80, handling: 81, snow_traction: 72, ice_braking: 60, fuel_economy: 84, tread_life: 85, cr_overall: 84 } },
            "2026": { sales: 24.0, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.1, noise: 8.8, treadwear: 8.6, user_rating: 8.6 }, consumerreports: { dry_braking: 83, wet_braking: 81, handling: 82, snow_traction: 73, ice_braking: 61, fuel_economy: 85, tread_life: 85, cr_overall: 85 } }
        }
    },
    {
        brand: "Hankook",
        model: "Kinergy 4S2",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 16.3, tirerack: { dry_traction: 8.8, wet_traction: 8.9, hydroplaning: 8.8, comfort: 8.7, noise: 8.4, treadwear: 8.6, user_rating: 8.8 }, consumerreports: { dry_braking: 83, wet_braking: 85, handling: 82, snow_traction: 82, ice_braking: 70, fuel_economy: 79, tread_life: 88, cr_overall: 83 } },
            "2022": { sales: 17.1, tirerack: { dry_traction: 8.9, wet_traction: 9.0, hydroplaning: 8.9, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 86, handling: 83, snow_traction: 83, ice_braking: 70, fuel_economy: 80, tread_life: 88, cr_overall: 85 } }, // 유럽 친환경 올웨더 교체 수요 폭증으로 불황기 단독 성장
            "2023": { sales: 18.5, tirerack: { dry_traction: 9.0, wet_traction: 9.1, hydroplaning: 9.0, comfort: 8.9, noise: 8.6, treadwear: 8.7, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 87, handling: 84, snow_traction: 84, ice_braking: 71, fuel_economy: 80, tread_life: 89, cr_overall: 87 } },
            "2024": { sales: 20.7, tirerack: { dry_traction: 9.0, wet_traction: 9.1, hydroplaning: 9.0, comfort: 8.9, noise: 8.6, treadwear: 8.7, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 87, handling: 84, snow_traction: 85, ice_braking: 71, fuel_economy: 81, tread_life: 89, cr_overall: 88 } },
            "2025": { sales: 22.9, tirerack: { dry_traction: 9.1, wet_traction: 9.2, hydroplaning: 9.1, comfort: 9.0, noise: 8.7, treadwear: 8.8, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 88, handling: 85, snow_traction: 85, ice_braking: 72, fuel_economy: 81, tread_life: 90, cr_overall: 89 } },
            "2026": { sales: 25.8, tirerack: { dry_traction: 9.1, wet_traction: 9.2, hydroplaning: 9.1, comfort: 9.0, noise: 8.7, treadwear: 8.8, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 88, handling: 85, snow_traction: 86, ice_braking: 72, fuel_economy: 82, tread_life: 90, cr_overall: 90 } }
        }
    },
    {
        brand: "Hankook",
        model: "Winter i*cept evo3",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 11.3, tirerack: { dry_traction: 8.3, wet_traction: 8.5, hydroplaning: 8.4, comfort: 8.6, noise: 8.3, treadwear: 8.4, user_rating: 8.6 }, consumerreports: { dry_braking: 72, wet_braking: 78, handling: 76, snow_traction: 94, ice_braking: 90, fuel_economy: 80, tread_life: 82, cr_overall: 81 } },
            "2022": { sales: 10.8, tirerack: { dry_traction: 8.3, wet_traction: 8.5, hydroplaning: 8.5, comfort: 8.6, noise: 8.4, treadwear: 8.4, user_rating: 8.7 }, consumerreports: { dry_braking: 72, wet_braking: 78, handling: 76, snow_traction: 94, ice_braking: 91, fuel_economy: 80, tread_life: 82, cr_overall: 82 } },
            "2023": { sales: 11.6, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.5, comfort: 8.7, noise: 8.4, treadwear: 8.5, user_rating: 8.7 }, consumerreports: { dry_braking: 73, wet_braking: 79, handling: 77, snow_traction: 95, ice_braking: 91, fuel_economy: 81, tread_life: 83, cr_overall: 83 } },
            "2024": { sales: 12.8, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.6, comfort: 8.7, noise: 8.5, treadwear: 8.5, user_rating: 8.8 }, consumerreports: { dry_braking: 73, wet_braking: 79, handling: 77, snow_traction: 95, ice_braking: 92, fuel_economy: 81, tread_life: 83, cr_overall: 84 } },
            "2025": { sales: 14.2, tirerack: { dry_traction: 8.5, wet_traction: 8.7, hydroplaning: 8.6, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 8.8 }, consumerreports: { dry_braking: 74, wet_braking: 80, handling: 78, snow_traction: 96, ice_braking: 92, fuel_economy: 82, tread_life: 84, cr_overall: 85 } },
            "2026": { sales: 15.6, tirerack: { dry_traction: 8.5, wet_traction: 8.7, hydroplaning: 8.7, comfort: 8.8, noise: 8.6, treadwear: 8.6, user_rating: 8.9 }, consumerreports: { dry_braking: 74, wet_braking: 80, handling: 78, snow_traction: 96, ice_braking: 93, fuel_economy: 82, tread_life: 84, cr_overall: 86 } }
        }
    },
    {
        brand: "Hankook",
        model: "Dynapro AT2",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 12.5, tirerack: { dry_traction: 8.7, wet_traction: 8.3, hydroplaning: 8.4, comfort: 8.6, noise: 8.4, treadwear: 8.6, user_rating: 8.5 }, consumerreports: { dry_braking: 76, wet_braking: 75, handling: 74, snow_traction: 82, ice_braking: 60, fuel_economy: 78, tread_life: 86, cr_overall: 78 } },
            "2022": { sales: 12.1, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.4, comfort: 8.6, noise: 8.4, treadwear: 8.6, user_rating: 8.5 }, consumerreports: { dry_braking: 77, wet_braking: 76, handling: 74, snow_traction: 82, ice_braking: 60, fuel_economy: 78, tread_life: 86, cr_overall: 79 } },
            "2023": { sales: 12.8, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.7, noise: 8.5, treadwear: 8.7, user_rating: 8.6 }, consumerreports: { dry_braking: 77, wet_braking: 76, handling: 75, snow_traction: 83, ice_braking: 61, fuel_economy: 79, tread_life: 87, cr_overall: 81 } },
            "2024": { sales: 14.1, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.5, comfort: 8.7, noise: 8.5, treadwear: 8.7, user_rating: 8.6 }, consumerreports: { dry_braking: 78, wet_braking: 77, handling: 75, snow_traction: 83, ice_braking: 61, fuel_economy: 79, tread_life: 87, cr_overall: 82 } },
            "2025": { sales: 16.0, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.6, comfort: 8.8, noise: 8.6, treadwear: 8.8, user_rating: 8.7 }, consumerreports: { dry_braking: 78, wet_braking: 77, handling: 76, snow_traction: 84, ice_braking: 62, fuel_economy: 80, tread_life: 88, cr_overall: 83 } },
            "2026": { sales: 18.0, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.6, comfort: 8.8, noise: 8.6, treadwear: 8.8, user_rating: 8.7 }, consumerreports: { dry_braking: 79, wet_braking: 78, handling: 76, snow_traction: 84, ice_braking: 62, fuel_economy: 80, tread_life: 88, cr_overall: 84 } }
        }
    },

    // =============================================================
    // 2. 경쟁 타사 타이어 모델 (침체기 불황 하락 및 반등 시나리오 적용)
    // =============================================================
    {
        brand: "Michelin",
        model: "Pilot Sport 4S",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 82.4, tirerack: { dry_traction: 9.6, wet_traction: 9.4, hydroplaning: 9.2, comfort: 8.7, noise: 8.4, treadwear: 8.5, user_rating: 9.3 }, consumerreports: { dry_braking: 95, wet_braking: 92, handling: 96, snow_traction: 42, ice_braking: 35, fuel_economy: 75, tread_life: 82, cr_overall: 90 } },
            "2022": { sales: 76.5, tirerack: { dry_traction: 9.6, wet_traction: 9.4, hydroplaning: 9.2, comfort: 8.7, noise: 8.4, treadwear: 8.6, user_rating: 9.4 }, consumerreports: { dry_braking: 95, wet_braking: 92, handling: 96, snow_traction: 42, ice_braking: 35, fuel_economy: 76, tread_life: 83, cr_overall: 91 } }, // 공급망 대란 판매량 감소
            "2023": { sales: 72.1, tirerack: { dry_traction: 9.7, wet_traction: 9.5, hydroplaning: 9.3, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 9.4 }, consumerreports: { dry_braking: 96, wet_braking: 93, handling: 97, snow_traction: 43, ice_braking: 36, fuel_economy: 76, tread_life: 83, cr_overall: 92 } }, // 고가 UHP 기피 현상 심화
            "2024": { sales: 80.4, tirerack: { dry_traction: 9.7, wet_traction: 9.5, hydroplaning: 9.3, comfort: 8.8, noise: 8.6, treadwear: 8.7, user_rating: 9.5 }, consumerreports: { dry_braking: 96, wet_braking: 93, handling: 97, snow_traction: 44, ice_braking: 37, fuel_economy: 77, tread_life: 85, cr_overall: 93 } },
            "2025": { sales: 91.2, tirerack: { dry_traction: 9.8, wet_traction: 9.6, hydroplaning: 9.4, comfort: 8.9, noise: 8.6, treadwear: 8.8, user_rating: 9.5 }, consumerreports: { dry_braking: 97, wet_braking: 94, handling: 98, snow_traction: 44, ice_braking: 37, fuel_economy: 78, tread_life: 86, cr_overall: 94 } }, // 경기 완화로 고급 스포츠카 OE 수요 복원
            "2026": { sales: 102.3, tirerack: { dry_traction: 9.8, wet_traction: 9.6, hydroplaning: 9.4, comfort: 8.9, noise: 8.7, treadwear: 8.8, user_rating: 9.6 }, consumerreports: { dry_braking: 97, wet_braking: 94, handling: 98, snow_traction: 45, ice_braking: 38, fuel_economy: 78, tread_life: 86, cr_overall: 95 } }
        }
    },
    {
        brand: "Michelin",
        model: "CrossClimate 2",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 110.5, tirerack: { dry_traction: 9.2, wet_traction: 9.3, hydroplaning: 9.1, comfort: 9.0, noise: 8.6, treadwear: 8.9, user_rating: 9.2 }, consumerreports: { dry_braking: 88, wet_braking: 89, handling: 86, snow_traction: 85, ice_braking: 74, fuel_economy: 80, tread_life: 92, cr_overall: 88 } },
            "2022": { sales: 105.2, tirerack: { dry_traction: 9.3, wet_traction: 9.4, hydroplaning: 9.2, comfort: 9.1, noise: 8.7, treadwear: 9.0, user_rating: 9.3 }, consumerreports: { dry_braking: 89, wet_braking: 90, handling: 87, snow_traction: 87, ice_braking: 75, fuel_economy: 81, tread_life: 92, cr_overall: 90 } },
            "2023": { sales: 109.8, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.3, comfort: 9.2, noise: 8.8, treadwear: 9.1, user_rating: 9.4 }, consumerreports: { dry_braking: 90, wet_braking: 91, handling: 88, snow_traction: 89, ice_braking: 76, fuel_economy: 82, tread_life: 93, cr_overall: 92 } },
            "2024": { sales: 125.4, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.3, comfort: 9.2, noise: 8.8, treadwear: 9.2, user_rating: 9.4 }, consumerreports: { dry_braking: 90, wet_braking: 91, handling: 88, snow_traction: 90, ice_braking: 77, fuel_economy: 83, tread_life: 94, cr_overall: 93 } },
            "2025": { sales: 144.1, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.3, noise: 8.9, treadwear: 9.3, user_rating: 9.5 }, consumerreports: { dry_braking: 91, wet_braking: 92, handling: 89, snow_traction: 90, ice_braking: 78, fuel_economy: 83, tread_life: 95, cr_overall: 94 } },
            "2026": { sales: 165.8, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.3, noise: 8.9, treadwear: 9.3, user_rating: 9.5 }, consumerreports: { dry_braking: 91, wet_braking: 92, handling: 89, snow_traction: 91, ice_braking: 78, fuel_economy: 84, tread_life: 95, cr_overall: 95 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Potenza Sport",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 74.5, tirerack: { dry_traction: 9.5, wet_traction: 9.2, hydroplaning: 8.9, comfort: 8.1, noise: 7.8, treadwear: 7.4, user_rating: 8.8 }, consumerreports: { dry_braking: 93, wet_braking: 88, handling: 93, snow_traction: 38, ice_braking: 30, fuel_economy: 68, tread_life: 72, cr_overall: 83 } },
            "2022": { sales: 68.2, tirerack: { dry_traction: 9.5, wet_traction: 9.3, hydroplaning: 9.0, comfort: 8.2, noise: 7.9, treadwear: 7.5, user_rating: 8.8 }, consumerreports: { dry_braking: 94, wet_braking: 89, handling: 94, snow_traction: 39, ice_braking: 31, fuel_economy: 69, tread_life: 73, cr_overall: 85 } },
            "2023": { sales: 61.6, tirerack: { dry_traction: 9.6, wet_traction: 9.3, hydroplaning: 9.0, comfort: 8.2, noise: 7.9, treadwear: 7.6, user_rating: 8.9 }, consumerreports: { dry_braking: 94, wet_braking: 89, handling: 94, snow_traction: 39, ice_braking: 31, fuel_economy: 69, tread_life: 74, cr_overall: 86 } },
            "2024": { sales: 71.3, tirerack: { dry_traction: 9.6, wet_traction: 9.4, hydroplaning: 9.1, comfort: 8.3, noise: 8.0, treadwear: 7.7, user_rating: 9.0 }, consumerreports: { dry_braking: 95, wet_braking: 90, handling: 95, snow_traction: 40, ice_braking: 32, fuel_economy: 70, tread_life: 75, cr_overall: 87 } },
            "2025": { sales: 81.0, tirerack: { dry_traction: 9.7, wet_traction: 9.4, hydroplaning: 9.1, comfort: 8.3, noise: 8.0, treadwear: 7.7, user_rating: 9.0 }, consumerreports: { dry_braking: 95, wet_braking: 90, handling: 95, snow_traction: 40, ice_braking: 32, fuel_economy: 71, tread_life: 76, cr_overall: 88 } },
            "2026": { sales: 92.5, tirerack: { dry_traction: 9.7, wet_traction: 9.5, hydroplaning: 9.2, comfort: 8.4, noise: 8.1, treadwear: 7.8, user_rating: 9.1 }, consumerreports: { dry_braking: 96, wet_braking: 91, handling: 96, snow_traction: 41, ice_braking: 33, fuel_economy: 71, tread_life: 76, cr_overall: 89 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Turanza QuietTrack",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 90.2, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.3, noise: 9.1, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 82, snow_traction: 80, ice_braking: 68, fuel_economy: 88, tread_life: 94, cr_overall: 85 } },
            "2022": { sales: 84.1, tirerack: { dry_traction: 8.9, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.3, noise: 9.1, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 83, snow_traction: 80, ice_braking: 69, fuel_economy: 89, tread_life: 94, cr_overall: 86 } },
            "2023": { sales: 81.3, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 9.3, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 83, snow_traction: 81, ice_braking: 69, fuel_economy: 89, tread_life: 95, cr_overall: 87 } },
            "2024": { sales: 89.8, tirerack: { dry_traction: 9.0, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.4, noise: 9.2, treadwear: 9.3, user_rating: 9.0 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 84, snow_traction: 81, ice_braking: 70, fuel_economy: 90, tread_life: 95, cr_overall: 88 } },
            "2025": { sales: 97.2, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 9.4, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 84, snow_traction: 82, ice_braking: 70, fuel_economy: 90, tread_life: 96, cr_overall: 89 } },
            "2026": { sales: 105.1, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.5, noise: 9.3, treadwear: 9.4, user_rating: 9.1 }, consumerreports: { dry_braking: 87, wet_braking: 85, handling: 85, snow_traction: 82, ice_braking: 71, fuel_economy: 91, tread_life: 96, cr_overall: 90 } }
        }
    },
    {
        brand: "Continental",
        model: "ExtremeContact DWS06 Plus",
        segment: "Ultra High Performance (UHP)",
        season: "All-Season", // 사계절 초고성능 타이어로 명확하게 분류
        yearlyData: {
            "2021": { sales: 88.5, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.3, comfort: 9.1, noise: 8.7, treadwear: 8.6, user_rating: 9.4 }, consumerreports: { dry_braking: 90, wet_braking: 92, handling: 92, snow_traction: 68, ice_braking: 50, fuel_economy: 77, tread_life: 84, cr_overall: 91 } },
            "2022": { sales: 83.2, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.4, comfort: 9.1, noise: 8.8, treadwear: 8.7, user_rating: 9.4 }, consumerreports: { dry_braking: 91, wet_braking: 93, handling: 93, snow_traction: 68, ice_braking: 51, fuel_economy: 77, tread_life: 84, cr_overall: 92 } },
            "2023": { sales: 80.4, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.2, noise: 8.8, treadwear: 8.7, user_rating: 9.5 }, consumerreports: { dry_braking: 91, wet_braking: 93, handling: 93, snow_traction: 69, ice_braking: 51, fuel_economy: 78, tread_life: 85, cr_overall: 93 } },
            "2024": { sales: 90.5, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.5, comfort: 9.2, noise: 8.9, treadwear: 8.8, user_rating: 9.5 }, consumerreports: { dry_braking: 92, wet_braking: 94, handling: 94, snow_traction: 70, ice_braking: 52, fuel_economy: 78, tread_life: 85, cr_overall: 94 } },
            "2025": { sales: 99.8, tirerack: { dry_traction: 9.6, wet_traction: 9.7, hydroplaning: 9.5, comfort: 9.3, noise: 8.9, treadwear: 8.9, user_rating: 9.6 }, consumerreports: { dry_braking: 92, wet_braking: 94, handling: 94, snow_traction: 70, ice_braking: 52, fuel_economy: 79, tread_life: 86, cr_overall: 95 } },
            "2026": { sales: 110.1, tirerack: { dry_traction: 9.6, wet_traction: 9.7, hydroplaning: 9.6, comfort: 9.3, noise: 9.0, treadwear: 8.9, user_rating: 9.6 }, consumerreports: { dry_braking: 93, wet_braking: 95, handling: 95, snow_traction: 71, ice_braking: 53, fuel_economy: 79, tread_life: 86, cr_overall: 96 } }
        }
    },
    {
        brand: "Continental",
        model: "PureContact LS",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 85.4, tirerack: { dry_traction: 9.1, wet_traction: 9.0, hydroplaning: 9.1, comfort: 9.2, noise: 8.9, treadwear: 9.1, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 87, handling: 85, snow_traction: 74, ice_braking: 66, fuel_economy: 83, tread_life: 92, cr_overall: 86 } },
            "2022": { sales: 79.8, tirerack: { dry_traction: 9.1, wet_traction: 9.1, hydroplaning: 9.1, comfort: 9.2, noise: 8.9, treadwear: 9.1, user_rating: 9.1 }, consumerreports: { dry_braking: 87, wet_braking: 88, handling: 85, snow_traction: 74, ice_braking: 66, fuel_economy: 84, tread_life: 92, cr_overall: 87 } },
            "2023": { sales: 76.2, tirerack: { dry_traction: 9.2, wet_traction: 9.1, hydroplaning: 9.2, comfort: 9.3, noise: 9.0, treadwear: 9.2, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 88, handling: 86, snow_traction: 75, ice_braking: 67, fuel_economy: 84, tread_life: 93, cr_overall: 88 } },
            "2024": { sales: 84.5, tirerack: { dry_traction: 9.2, wet_traction: 9.2, hydroplaning: 9.2, comfort: 9.3, noise: 9.0, treadwear: 9.2, user_rating: 9.2 }, consumerreports: { dry_braking: 88, wet_braking: 89, handling: 86, snow_traction: 75, ice_braking: 67, fuel_economy: 85, tread_life: 93, cr_overall: 89 } },
            "2025": { sales: 92.4, tirerack: { dry_traction: 9.3, wet_traction: 9.2, hydroplaning: 9.3, comfort: 9.4, noise: 9.1, treadwear: 9.3, user_rating: 9.3 }, consumerreports: { dry_braking: 88, wet_braking: 89, handling: 87, snow_traction: 76, ice_braking: 68, fuel_economy: 85, tread_life: 94, cr_overall: 90 } },
            "2026": { sales: 101.1, tirerack: { dry_traction: 9.3, wet_traction: 9.3, hydroplaning: 9.3, comfort: 9.4, noise: 9.1, treadwear: 9.3, user_rating: 9.3 }, consumerreports: { dry_braking: 89, wet_braking: 90, handling: 87, snow_traction: 76, ice_braking: 68, fuel_economy: 86, tread_life: 94, cr_overall: 91 } }
        }
    },
    {
        brand: "Continental",
        model: "TerrainContact A/T",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 48.5, tirerack: { dry_traction: 9.1, wet_traction: 9.2, hydroplaning: 9.1, comfort: 9.0, noise: 8.9, treadwear: 8.8, user_rating: 9.0 }, consumerreports: { dry_braking: 82, wet_braking: 84, handling: 80, snow_traction: 81, ice_braking: 64, fuel_economy: 75, tread_life: 88, cr_overall: 83 } },
            "2022": { sales: 45.1, tirerack: { dry_traction: 9.1, wet_traction: 9.2, hydroplaning: 9.1, comfort: 9.0, noise: 8.9, treadwear: 8.8, user_rating: 9.1 }, consumerreports: { dry_braking: 83, wet_braking: 85, handling: 81, snow_traction: 81, ice_braking: 64, fuel_economy: 75, tread_life: 88, cr_overall: 84 } },
            "2023": { sales: 42.8, tirerack: { dry_traction: 9.2, wet_traction: 9.3, hydroplaning: 9.2, comfort: 9.1, noise: 9.0, treadwear: 8.9, user_rating: 9.1 }, consumerreports: { dry_braking: 83, wet_braking: 85, handling: 81, snow_traction: 82, ice_braking: 65, fuel_economy: 76, tread_life: 89, cr_overall: 85 } },
            "2024": { sales: 49.3, tirerack: { dry_traction: 9.2, wet_traction: 9.3, hydroplaning: 9.2, comfort: 9.1, noise: 9.0, treadwear: 8.9, user_rating: 9.2 }, consumerreports: { dry_braking: 84, wet_braking: 86, handling: 82, snow_traction: 82, ice_braking: 65, fuel_economy: 76, tread_life: 89, cr_overall: 86 } },
            "2025": { sales: 56.0, tirerack: { dry_traction: 9.3, wet_traction: 9.4, hydroplaning: 9.3, comfort: 9.2, noise: 9.1, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 84, wet_braking: 86, handling: 82, snow_traction: 83, ice_braking: 66, fuel_economy: 77, tread_life: 90, cr_overall: 87 } },
            "2026": { sales: 63.5, tirerack: { dry_traction: 9.3, wet_traction: 9.4, hydroplaning: 9.3, comfort: 9.2, noise: 9.1, treadwear: 9.0, user_rating: 9.3 }, consumerreports: { dry_braking: 85, wet_braking: 87, handling: 83, snow_traction: 83, ice_braking: 66, fuel_economy: 77, tread_life: 90, cr_overall: 88 } }
        }
    },
    {
        brand: "Goodyear",
        model: "Assurance WeatherReady",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 102.4, tirerack: { dry_traction: 8.7, wet_traction: 8.8, hydroplaning: 8.9, comfort: 8.6, noise: 8.1, treadwear: 8.5, user_rating: 8.6 }, consumerreports: { dry_braking: 80, wet_braking: 82, handling: 82, snow_traction: 88, ice_braking: 72, fuel_economy: 76, tread_life: 86, cr_overall: 84 } },
            "2022": { sales: 94.2, tirerack: { dry_traction: 8.7, wet_traction: 8.8, hydroplaning: 8.9, comfort: 8.6, noise: 8.2, treadwear: 8.5, user_rating: 8.7 }, consumerreports: { dry_braking: 81, wet_braking: 83, handling: 83, snow_traction: 88, ice_braking: 72, fuel_economy: 76, tread_life: 86, cr_overall: 85 } },
            "2023": { sales: 90.5, tirerack: { dry_traction: 8.8, wet_traction: 8.9, hydroplaning: 9.0, comfort: 8.7, noise: 8.2, treadwear: 8.6, user_rating: 8.7 }, consumerreports: { dry_braking: 81, wet_braking: 83, handling: 83, snow_traction: 89, ice_braking: 73, fuel_economy: 77, tread_life: 87, cr_overall: 86 } },
            "2024": { sales: 102.1, tirerack: { dry_traction: 8.8, wet_traction: 8.9, hydroplaning: 9.0, comfort: 8.7, noise: 8.3, treadwear: 8.6, user_rating: 8.8 }, consumerreports: { dry_braking: 82, wet_braking: 84, handling: 84, snow_traction: 89, ice_braking: 73, fuel_economy: 77, tread_life: 87, cr_overall: 87 } },
            "2025": { sales: 115.4, tirerack: { dry_traction: 8.9, wet_traction: 9.0, hydroplaning: 9.1, comfort: 8.8, noise: 8.3, treadwear: 8.7, user_rating: 8.8 }, consumerreports: { dry_braking: 82, wet_braking: 84, handling: 84, snow_traction: 90, ice_braking: 74, fuel_economy: 78, tread_life: 88, cr_overall: 88 } },
            "2026": { sales: 130.8, tirerack: { dry_traction: 8.9, wet_traction: 9.0, hydroplaning: 9.1, comfort: 8.8, noise: 8.4, treadwear: 8.7, user_rating: 8.9 }, consumerreports: { dry_braking: 83, wet_braking: 85, handling: 85, snow_traction: 90, ice_braking: 74, fuel_economy: 78, tread_life: 88, cr_overall: 89 } }
        }
    },
    {
        brand: "Goodyear",
        model: "Wrangler DuraTrac",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 72.1, tirerack: { dry_traction: 8.8, wet_traction: 8.3, hydroplaning: 8.4, comfort: 8.1, noise: 7.4, treadwear: 8.2, user_rating: 8.6 }, consumerreports: { dry_braking: 74, wet_braking: 70, handling: 72, snow_traction: 92, ice_braking: 60, fuel_economy: 65, tread_life: 80, cr_overall: 76 } },
            "2022": { sales: 67.5, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.4, comfort: 8.1, noise: 7.4, treadwear: 8.2, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 71, handling: 73, snow_traction: 92, ice_braking: 60, fuel_economy: 65, tread_life: 80, cr_overall: 77 } },
            "2023": { sales: 64.0, tirerack: { dry_traction: 8.9, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.2, noise: 7.5, treadwear: 8.3, user_rating: 8.7 }, consumerreports: { dry_braking: 75, wet_braking: 71, handling: 73, snow_traction: 93, ice_braking: 61, fuel_economy: 66, tread_life: 81, cr_overall: 78 } },
            "2024": { sales: 70.2, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.5, comfort: 8.2, noise: 7.5, treadwear: 8.3, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 72, handling: 74, snow_traction: 93, ice_braking: 61, fuel_economy: 66, tread_life: 81, cr_overall: 79 } },
            "2025": { sales: 76.8, tirerack: { dry_traction: 9.0, wet_traction: 8.5, hydroplaning: 8.6, comfort: 8.3, noise: 7.6, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 76, wet_braking: 72, handling: 74, snow_traction: 94, ice_braking: 62, fuel_economy: 67, tread_life: 82, cr_overall: 80 } },
            "2026": { sales: 84.2, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.6, comfort: 8.3, noise: 7.6, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 77, wet_braking: 73, handling: 75, snow_traction: 94, ice_braking: 62, fuel_economy: 67, tread_life: 82, cr_overall: 81 } }
        }
    },
    {
        brand: "Pirelli",
        model: "P Zero PZ4",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 68.4, tirerack: { dry_traction: 9.5, wet_traction: 9.1, hydroplaning: 8.8, comfort: 8.3, noise: 8.1, treadwear: 7.6, user_rating: 8.7 }, consumerreports: { dry_braking: 94, wet_braking: 86, handling: 95, snow_traction: 30, ice_braking: 25, fuel_economy: 70, tread_life: 70, cr_overall: 81 } },
            "2022": { sales: 62.1, tirerack: { dry_traction: 9.5, wet_traction: 9.2, hydroplaning: 8.9, comfort: 8.3, noise: 8.1, treadwear: 7.7, user_rating: 8.7 }, consumerreports: { dry_braking: 94, wet_braking: 87, handling: 95, snow_traction: 31, ice_braking: 26, fuel_economy: 71, tread_life: 71, cr_overall: 83 } },
            "2023": { sales: 58.6, tirerack: { dry_traction: 9.6, wet_traction: 9.2, hydroplaning: 8.9, comfort: 8.4, noise: 8.2, treadwear: 7.7, user_rating: 8.8 }, consumerreports: { dry_braking: 95, wet_braking: 87, handling: 96, snow_traction: 31, ice_braking: 26, fuel_economy: 71, tread_life: 71, cr_overall: 84 } },
            "2024": { sales: 66.8, tirerack: { dry_traction: 9.6, wet_traction: 9.3, hydroplaning: 9.0, comfort: 8.4, noise: 8.2, treadwear: 7.8, user_rating: 8.9 }, consumerreports: { dry_braking: 95, wet_braking: 88, handling: 96, snow_traction: 32, ice_braking: 27, fuel_economy: 72, tread_life: 72, cr_overall: 85 } },
            "2025": { sales: 74.5, tirerack: { dry_traction: 9.7, wet_traction: 9.3, hydroplaning: 9.0, comfort: 8.5, noise: 8.3, treadwear: 7.9, user_rating: 8.9 }, consumerreports: { dry_braking: 96, wet_braking: 88, handling: 97, snow_traction: 32, ice_braking: 27, fuel_economy: 72, tread_life: 73, cr_overall: 86 } },
            "2026": { sales: 83.8, tirerack: { dry_traction: 9.7, wet_traction: 9.4, hydroplaning: 9.1, comfort: 8.5, noise: 8.3, treadwear: 7.9, user_rating: 9.0 }, consumerreports: { dry_braking: 96, wet_braking: 89, handling: 97, snow_traction: 33, ice_braking: 28, fuel_economy: 73, tread_life: 73, cr_overall: 87 } }
        }
    },
    {
        brand: "Pirelli",
        model: "Cinturato P7 AS Plus II",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 76.5, tirerack: { dry_traction: 9.0, wet_traction: 8.8, hydroplaning: 8.7, comfort: 9.4, noise: 9.2, treadwear: 8.8, user_rating: 9.0 }, consumerreports: { dry_braking: 84, wet_braking: 83, handling: 84, snow_traction: 72, ice_braking: 64, fuel_economy: 85, tread_life: 90, cr_overall: 84 } },
            "2022": { sales: 71.0, tirerack: { dry_traction: 9.0, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 8.8, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 84, snow_traction: 72, ice_braking: 64, fuel_economy: 85, tread_life: 90, cr_overall: 85 } },
            "2023": { sales: 68.3, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.5, noise: 9.3, treadwear: 8.9, user_rating: 9.1 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 85, snow_traction: 73, ice_braking: 65, fuel_economy: 86, tread_life: 91, cr_overall: 86 } },
            "2024": { sales: 75.1, tirerack: { dry_traction: 9.1, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 8.9, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 85, snow_traction: 73, ice_braking: 65, fuel_economy: 86, tread_life: 91, cr_overall: 87 } },
            "2025": { sales: 82.0, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 86, snow_traction: 74, ice_braking: 66, fuel_economy: 87, tread_life: 92, cr_overall: 88 } },
            "2026": { sales: 89.9, tirerack: { dry_traction: 9.2, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.4, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 86, handling: 86, snow_traction: 74, ice_braking: 66, fuel_economy: 87, tread_life: 92, cr_overall: 89 } }
        }
    },
    {
        brand: "Michelin",
        model: "X-Ice Snow",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 62.1, tirerack: { dry_traction: 8.0, wet_traction: 8.3, hydroplaning: 8.5, comfort: 8.9, noise: 8.7, treadwear: 9.1, user_rating: 9.0 }, consumerreports: { dry_braking: 70, wet_braking: 75, handling: 72, snow_traction: 96, ice_braking: 94, fuel_economy: 84, tread_life: 88, cr_overall: 87 } },
            "2022": { sales: 58.5, tirerack: { dry_traction: 8.0, wet_traction: 8.4, hydroplaning: 8.6, comfort: 8.9, noise: 8.7, treadwear: 9.1, user_rating: 9.0 }, consumerreports: { dry_braking: 70, wet_braking: 76, handling: 73, snow_traction: 97, ice_braking: 95, fuel_economy: 84, tread_life: 88, cr_overall: 88 } },
            "2023": { sales: 54.2, tirerack: { dry_traction: 8.1, wet_traction: 8.4, hydroplaning: 8.6, comfort: 9.0, noise: 8.8, treadwear: 9.2, user_rating: 9.1 }, consumerreports: { dry_braking: 71, wet_braking: 76, handling: 73, snow_traction: 97, ice_braking: 95, fuel_economy: 85, tread_life: 89, cr_overall: 89 } },
            "2024": { sales: 62.1, tirerack: { dry_traction: 8.1, wet_traction: 8.5, hydroplaning: 8.7, comfort: 9.0, noise: 8.8, treadwear: 9.2, user_rating: 9.1 }, consumerreports: { dry_braking: 72, wet_braking: 77, handling: 74, snow_traction: 98, ice_braking: 96, fuel_economy: 85, tread_life: 89, cr_overall: 90 } },
            "2025": { sales: 69.8, tirerack: { dry_traction: 8.2, wet_traction: 8.5, hydroplaning: 8.7, comfort: 9.1, noise: 8.9, treadwear: 9.3, user_rating: 9.2 }, consumerreports: { dry_braking: 72, wet_braking: 78, handling: 74, snow_traction: 98, ice_braking: 96, fuel_economy: 86, tread_life: 90, cr_overall: 91 } },
            "2026": { sales: 77.8, tirerack: { dry_traction: 8.2, wet_traction: 8.6, hydroplaning: 8.8, comfort: 9.1, noise: 8.9, treadwear: 9.3, user_rating: 9.2 }, consumerreports: { dry_braking: 73, wet_braking: 78, handling: 75, snow_traction: 99, ice_braking: 97, fuel_economy: 86, tread_life: 90, cr_overall: 92 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Blizzak WS90",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 78.4, tirerack: { dry_traction: 7.8, wet_traction: 8.2, hydroplaning: 8.4, comfort: 8.6, noise: 8.3, treadwear: 8.4, user_rating: 9.2 }, consumerreports: { dry_braking: 68, wet_braking: 72, handling: 70, snow_traction: 99, ice_braking: 98, fuel_economy: 78, tread_life: 80, cr_overall: 88 } },
            "2022": { sales: 72.1, tirerack: { dry_traction: 7.8, wet_traction: 8.3, hydroplaning: 8.5, comfort: 8.6, noise: 8.4, treadwear: 8.4, user_rating: 9.2 }, consumerreports: { dry_braking: 68, wet_braking: 73, handling: 71, snow_traction: 99, ice_braking: 99, fuel_economy: 78, tread_life: 80, cr_overall: 89 } },
            "2023": { sales: 69.4, tirerack: { dry_traction: 7.9, wet_traction: 8.3, hydroplaning: 8.5, comfort: 8.7, noise: 8.4, treadwear: 8.5, user_rating: 9.3 }, consumerreports: { dry_braking: 69, wet_braking: 73, handling: 71, snow_traction: 99, ice_braking: 99, fuel_economy: 79, tread_life: 81, cr_overall: 90 } },
            "2024": { sales: 78.0, tirerack: { dry_traction: 7.9, wet_traction: 8.4, hydroplaning: 8.6, comfort: 8.7, noise: 8.5, treadwear: 8.5, user_rating: 9.3 }, consumerreports: { dry_braking: 69, wet_braking: 74, handling: 72, snow_traction: 99, ice_braking: 99, fuel_economy: 79, tread_life: 81, cr_overall: 91 } },
            "2025": { sales: 86.3, tirerack: { dry_traction: 8.0, wet_traction: 8.4, hydroplaning: 8.6, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 9.4 }, consumerreports: { dry_braking: 70, wet_braking: 74, handling: 72, snow_traction: 99, ice_braking: 99, fuel_economy: 80, tread_life: 82, cr_overall: 92 } },
            "2026": { sales: 94.6, tirerack: { dry_traction: 8.0, wet_traction: 8.5, hydroplaning: 8.7, comfort: 8.8, noise: 8.6, treadwear: 8.6, user_rating: 9.4 }, consumerreports: { dry_braking: 70, wet_braking: 75, handling: 73, snow_traction: 99, ice_braking: 99, fuel_economy: 80, tread_life: 82, cr_overall: 92 } }
        }
    },
    {
        brand: "Michelin",
        model: "LTX A/T 2",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 58.2, tirerack: { dry_traction: 8.9, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.8, noise: 8.5, treadwear: 9.0, user_rating: 8.7 }, consumerreports: { dry_braking: 78, wet_braking: 76, handling: 75, snow_traction: 75, ice_braking: 58, fuel_economy: 82, tread_life: 90, cr_overall: 79 } },
            "2022": { sales: 55.4, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.5, comfort: 8.8, noise: 8.5, treadwear: 9.0, user_rating: 8.7 }, consumerreports: { dry_braking: 79, wet_braking: 77, handling: 76, snow_traction: 76, ice_braking: 58, fuel_economy: 82, tread_life: 90, cr_overall: 80 } },
            "2023": { sales: 52.8, tirerack: { dry_traction: 9.0, wet_traction: 8.5, hydroplaning: 8.6, comfort: 8.9, noise: 8.6, treadwear: 9.1, user_rating: 8.8 }, consumerreports: { dry_braking: 79, wet_braking: 77, handling: 76, snow_traction: 77, ice_braking: 59, fuel_economy: 83, tread_life: 91, cr_overall: 81 } },
            "2024": { sales: 57.5, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.6, comfort: 8.9, noise: 8.6, treadwear: 9.1, user_rating: 8.8 }, consumerreports: { dry_braking: 80, wet_braking: 78, handling: 77, snow_traction: 77, ice_braking: 59, fuel_economy: 83, tread_life: 91, cr_overall: 82 } },
            "2025": { sales: 61.9, tirerack: { dry_traction: 9.1, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.0, noise: 8.7, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 80, wet_braking: 78, handling: 77, snow_traction: 78, ice_braking: 60, fuel_economy: 84, tread_life: 92, cr_overall: 83 } },
            "2026": { sales: 66.8, tirerack: { dry_traction: 9.1, wet_traction: 8.7, hydroplaning: 8.7, comfort: 9.0, noise: 8.7, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 81, wet_braking: 79, handling: 78, snow_traction: 78, ice_braking: 60, fuel_economy: 84, tread_life: 92, cr_overall: 84 } }
        }
    },
    {
        brand: "Kumho",
        model: "Crugen HP71",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 70.2, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.9, noise: 8.6, treadwear: 8.6, user_rating: 8.4 }, consumerreports: { dry_braking: 78, wet_braking: 79, handling: 79, snow_traction: 75, ice_braking: 58, fuel_economy: 80, tread_life: 85, cr_overall: 77 } },
            "2022": { sales: 65.4, tirerack: { dry_traction: 8.7, wet_traction: 8.5, hydroplaning: 8.5, comfort: 8.9, noise: 8.6, treadwear: 8.6, user_rating: 8.4 }, consumerreports: { dry_braking: 79, wet_braking: 80, handling: 79, snow_traction: 75, ice_braking: 58, fuel_economy: 80, tread_life: 85, cr_overall: 78 } },
            "2023": { sales: 61.2, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.0, noise: 8.7, treadwear: 8.7, user_rating: 8.5 }, consumerreports: { dry_braking: 79, wet_braking: 80, handling: 80, snow_traction: 76, ice_braking: 59, fuel_economy: 81, tread_life: 86, cr_overall: 79 } },
            "2024": { sales: 71.5, tirerack: { dry_traction: 8.8, wet_traction: 8.6, hydroplaning: 8.6, comfort: 9.0, noise: 8.7, treadwear: 8.7, user_rating: 8.5 }, consumerreports: { dry_braking: 80, wet_braking: 81, handling: 80, snow_traction: 76, ice_braking: 59, fuel_economy: 81, tread_life: 86, cr_overall: 80 } },
            "2025": { sales: 81.3, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.1, noise: 8.8, treadwear: 8.8, user_rating: 8.6 }, consumerreports: { dry_braking: 80, wet_braking: 81, handling: 81, snow_traction: 77, ice_braking: 60, fuel_economy: 82, tread_life: 87, cr_overall: 81 } },
            "2026": { sales: 93.4, tirerack: { dry_traction: 8.9, wet_traction: 8.7, hydroplaning: 8.7, comfort: 9.1, noise: 8.8, treadwear: 8.8, user_rating: 8.6 }, consumerreports: { dry_braking: 81, wet_braking: 82, handling: 81, snow_traction: 77, ice_braking: 60, fuel_economy: 82, tread_life: 87, cr_overall: 82 } }
        }
    },
    // =============================================================
    // 3. 글로벌 제조사별 누락 제품군 정합성 보강용 실존 프리미엄 타이어 15종
    // =============================================================
    {
        brand: "Michelin",
        model: "Defender 2",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 88.5, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 9.6, user_rating: 9.3 }, consumerreports: { dry_braking: 88, wet_braking: 85, handling: 84, snow_traction: 78, ice_braking: 68, fuel_economy: 86, tread_life: 98, cr_overall: 90 } },
            "2022": { sales: 85.2, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 9.6, user_rating: 9.3 }, consumerreports: { dry_braking: 88, wet_braking: 85, handling: 84, snow_traction: 78, ice_braking: 68, fuel_economy: 86, tread_life: 98, cr_overall: 91 } },
            "2023": { sales: 89.0, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 9.7, user_rating: 9.4 }, consumerreports: { dry_braking: 89, wet_braking: 86, handling: 85, snow_traction: 79, ice_braking: 69, fuel_economy: 87, tread_life: 99, cr_overall: 92 } },
            "2024": { sales: 98.5, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 9.7, user_rating: 9.4 }, consumerreports: { dry_braking: 89, wet_braking: 86, handling: 85, snow_traction: 80, ice_braking: 70, fuel_economy: 87, tread_life: 99, cr_overall: 93 } },
            "2025": { sales: 110.2, tirerack: { dry_traction: 9.3, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.4, treadwear: 9.8, user_rating: 9.5 }, consumerreports: { dry_braking: 90, wet_braking: 87, handling: 86, snow_traction: 80, ice_braking: 70, fuel_economy: 88, tread_life: 100, cr_overall: 94 } },
            "2026": { sales: 124.0, tirerack: { dry_traction: 9.3, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.4, treadwear: 9.8, user_rating: 9.5 }, consumerreports: { dry_braking: 90, wet_braking: 87, handling: 86, snow_traction: 81, ice_braking: 71, fuel_economy: 88, tread_life: 100, cr_overall: 95 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Ecopia EP422 Plus",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 75.2, tirerack: { dry_traction: 8.6, wet_traction: 8.2, hydroplaning: 8.3, comfort: 9.0, noise: 8.8, treadwear: 8.8, user_rating: 8.4 }, consumerreports: { dry_braking: 82, wet_braking: 80, handling: 81, snow_traction: 71, ice_braking: 60, fuel_economy: 90, tread_life: 90, cr_overall: 80 } },
            "2022": { sales: 70.1, tirerack: { dry_traction: 8.6, wet_traction: 8.3, hydroplaning: 8.4, comfort: 9.0, noise: 8.8, treadwear: 8.8, user_rating: 8.4 }, consumerreports: { dry_braking: 82, wet_braking: 80, handling: 81, snow_traction: 71, ice_braking: 60, fuel_economy: 91, tread_life: 90, cr_overall: 81 } },
            "2023": { sales: 72.8, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.5, comfort: 9.1, noise: 8.9, treadwear: 8.9, user_rating: 8.5 }, consumerreports: { dry_braking: 83, wet_braking: 81, handling: 82, snow_traction: 72, ice_braking: 61, fuel_economy: 92, tread_life: 91, cr_overall: 82 } },
            "2024": { sales: 80.4, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.5, comfort: 9.1, noise: 8.9, treadwear: 8.9, user_rating: 8.5 }, consumerreports: { dry_braking: 83, wet_braking: 81, handling: 82, snow_traction: 72, ice_braking: 61, fuel_economy: 92, tread_life: 91, cr_overall: 83 } },
            "2025": { sales: 88.5, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.2, noise: 9.0, treadwear: 9.0, user_rating: 8.6 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 73, ice_braking: 62, fuel_economy: 93, tread_life: 92, cr_overall: 84 } },
            "2026": { sales: 98.0, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.2, noise: 9.0, treadwear: 9.0, user_rating: 8.6 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 73, ice_braking: 62, fuel_economy: 93, tread_life: 92, cr_overall: 85 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Dueler A/T Revo 3",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 48.4, tirerack: { dry_traction: 8.8, wet_traction: 8.3, hydroplaning: 8.2, comfort: 8.4, noise: 8.0, treadwear: 8.6, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 74, handling: 73, snow_traction: 83, ice_braking: 61, fuel_economy: 75, tread_life: 85, cr_overall: 76 } },
            "2022": { sales: 44.5, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.3, comfort: 8.4, noise: 8.0, treadwear: 8.6, user_rating: 8.6 }, consumerreports: { dry_braking: 76, wet_braking: 75, handling: 73, snow_traction: 83, ice_braking: 61, fuel_economy: 75, tread_life: 85, cr_overall: 77 } },
            "2023": { sales: 42.1, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.4, comfort: 8.5, noise: 8.1, treadwear: 8.7, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 75, handling: 74, snow_traction: 84, ice_braking: 62, fuel_economy: 76, tread_life: 86, cr_overall: 78 } },
            "2024": { sales: 48.0, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.4, comfort: 8.5, noise: 8.1, treadwear: 8.7, user_rating: 8.7 }, consumerreports: { dry_braking: 77, wet_braking: 76, handling: 74, snow_traction: 84, ice_braking: 62, fuel_economy: 76, tread_life: 86, cr_overall: 79 } },
            "2025": { sales: 54.2, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.5, comfort: 8.6, noise: 8.2, treadwear: 8.8, user_rating: 8.8 }, consumerreports: { dry_braking: 77, wet_braking: 76, handling: 75, snow_traction: 85, ice_braking: 63, fuel_economy: 77, tread_life: 87, cr_overall: 80 } },
            "2026": { sales: 60.8, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.5, comfort: 8.6, noise: 8.2, treadwear: 8.8, user_rating: 8.8 }, consumerreports: { dry_braking: 78, wet_braking: 77, handling: 75, snow_traction: 85, ice_braking: 63, fuel_economy: 77, tread_life: 87, cr_overall: 81 } }
        }
    },
    {
        brand: "Continental",
        model: "TrueContact Tour",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 80.1, tirerack: { dry_traction: 9.0, wet_traction: 8.8, hydroplaning: 8.7, comfort: 9.2, noise: 9.0, treadwear: 9.4, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 84, snow_traction: 78, ice_braking: 68, fuel_economy: 84, tread_life: 95, cr_overall: 85 } },
            "2022": { sales: 75.4, tirerack: { dry_traction: 9.0, wet_traction: 8.8, hydroplaning: 8.8, comfort: 9.2, noise: 9.0, treadwear: 9.4, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 84, snow_traction: 78, ice_braking: 68, fuel_economy: 84, tread_life: 95, cr_overall: 86 } },
            "2023": { sales: 78.2, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.9, comfort: 9.3, noise: 9.1, treadwear: 9.5, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 85, snow_traction: 79, ice_braking: 69, fuel_economy: 85, tread_life: 96, cr_overall: 87 } },
            "2024": { sales: 88.1, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.9, comfort: 9.3, noise: 9.1, treadwear: 9.5, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 85, snow_traction: 79, ice_braking: 69, fuel_economy: 85, tread_life: 96, cr_overall: 88 } },
            "2025": { sales: 98.0, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 9.0, comfort: 9.4, noise: 9.2, treadwear: 9.6, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 86, handling: 86, snow_traction: 80, ice_braking: 70, fuel_economy: 86, tread_life: 97, cr_overall: 89 } },
            "2026": { sales: 108.5, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 9.0, comfort: 9.4, noise: 9.2, treadwear: 9.6, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 86, handling: 86, snow_traction: 80, ice_braking: 70, fuel_economy: 86, tread_life: 97, cr_overall: 90 } }
        }
    },
    {
        brand: "Continental",
        model: "VikingContact 7",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 58.2, tirerack: { dry_traction: 8.2, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.8, noise: 8.6, treadwear: 8.5, user_rating: 9.2 }, consumerreports: { dry_braking: 71, wet_braking: 76, handling: 74, snow_traction: 98, ice_braking: 96, fuel_economy: 82, tread_life: 84, cr_overall: 87 } },
            "2022": { sales: 54.1, tirerack: { dry_traction: 8.2, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.8, noise: 8.6, treadwear: 8.5, user_rating: 9.2 }, consumerreports: { dry_braking: 71, wet_braking: 76, handling: 74, snow_traction: 98, ice_braking: 96, fuel_economy: 82, tread_life: 84, cr_overall: 88 } },
            "2023": { sales: 52.0, tirerack: { dry_traction: 8.3, wet_traction: 8.5, hydroplaning: 8.6, comfort: 8.9, noise: 8.7, treadwear: 8.6, user_rating: 9.3 }, consumerreports: { dry_braking: 72, wet_braking: 77, handling: 75, snow_traction: 99, ice_braking: 97, fuel_economy: 83, tread_life: 85, cr_overall: 89 } },
            "2024": { sales: 59.8, tirerack: { dry_traction: 8.3, wet_traction: 8.5, hydroplaning: 8.6, comfort: 8.9, noise: 8.7, treadwear: 8.6, user_rating: 9.3 }, consumerreports: { dry_braking: 72, wet_braking: 77, handling: 75, snow_traction: 99, ice_braking: 97, fuel_economy: 83, tread_life: 85, cr_overall: 90 } },
            "2025": { sales: 67.5, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.0, noise: 8.8, treadwear: 8.7, user_rating: 9.4 }, consumerreports: { dry_braking: 73, wet_braking: 78, handling: 76, snow_traction: 99, ice_braking: 98, fuel_economy: 84, tread_life: 86, cr_overall: 91 } },
            "2026": { sales: 75.0, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.0, noise: 8.8, treadwear: 8.7, user_rating: 9.4 }, consumerreports: { dry_braking: 73, wet_braking: 78, handling: 76, snow_traction: 99, ice_braking: 98, fuel_economy: 84, tread_life: 86, cr_overall: 92 } }
        }
    },
    {
        brand: "Pirelli",
        model: "P4 Persist AS Plus",
        segment: "All-Season Passenger",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 38.2, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.9, noise: 8.7, treadwear: 9.2, user_rating: 8.8 }, consumerreports: { dry_braking: 81, wet_braking: 80, handling: 80, snow_traction: 73, ice_braking: 60, fuel_economy: 84, tread_life: 92, cr_overall: 80 } },
            "2022": { sales: 35.4, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.5, comfort: 8.9, noise: 8.7, treadwear: 9.2, user_rating: 8.8 }, consumerreports: { dry_braking: 81, wet_braking: 80, handling: 80, snow_traction: 73, ice_braking: 60, fuel_economy: 84, tread_life: 92, cr_overall: 81 } },
            "2023": { sales: 36.8, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.0, noise: 8.8, treadwear: 9.3, user_rating: 8.9 }, consumerreports: { dry_braking: 82, wet_braking: 81, handling: 81, snow_traction: 74, ice_braking: 61, fuel_economy: 85, tread_life: 93, cr_overall: 82 } },
            "2024": { sales: 41.5, tirerack: { dry_traction: 8.9, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.0, noise: 8.8, treadwear: 9.3, user_rating: 8.9 }, consumerreports: { dry_braking: 82, wet_braking: 81, handling: 81, snow_traction: 74, ice_braking: 61, fuel_economy: 85, tread_life: 93, cr_overall: 83 } },
            "2025": { sales: 46.0, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.1, noise: 8.9, treadwear: 9.4, user_rating: 9.0 }, consumerreports: { dry_braking: 83, wet_braking: 82, handling: 82, snow_traction: 75, ice_braking: 62, fuel_economy: 86, tread_life: 94, cr_overall: 84 } },
            "2026": { sales: 51.2, tirerack: { dry_traction: 9.0, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.1, noise: 8.9, treadwear: 9.4, user_rating: 9.0 }, consumerreports: { dry_braking: 83, wet_braking: 82, handling: 82, snow_traction: 75, ice_braking: 62, fuel_economy: 86, tread_life: 94, cr_overall: 85 } }
        }
    },
    {
        brand: "Pirelli",
        model: "Winter Sottozero 3",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 32.4, tirerack: { dry_traction: 8.6, wet_traction: 8.8, hydroplaning: 8.6, comfort: 8.5, noise: 8.2, treadwear: 8.2, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 80, handling: 78, snow_traction: 92, ice_braking: 85, fuel_economy: 80, tread_life: 80, cr_overall: 82 } },
            "2022": { sales: 29.5, tirerack: { dry_traction: 8.6, wet_traction: 8.8, hydroplaning: 8.6, comfort: 8.5, noise: 8.2, treadwear: 8.2, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 80, handling: 78, snow_traction: 92, ice_braking: 85, fuel_economy: 80, tread_life: 80, cr_overall: 83 } },
            "2023": { sales: 28.0, tirerack: { dry_traction: 8.7, wet_traction: 8.9, hydroplaning: 8.7, comfort: 8.6, noise: 8.3, treadwear: 8.3, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 81, handling: 79, snow_traction: 93, ice_braking: 86, fuel_economy: 81, tread_life: 81, cr_overall: 84 } },
            "2024": { sales: 32.5, tirerack: { dry_traction: 8.7, wet_traction: 8.9, hydroplaning: 8.7, comfort: 8.6, noise: 8.3, treadwear: 8.3, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 81, handling: 79, snow_traction: 93, ice_braking: 86, fuel_economy: 81, tread_life: 81, cr_overall: 85 } },
            "2025": { sales: 36.8, tirerack: { dry_traction: 8.8, wet_traction: 9.0, hydroplaning: 8.8, comfort: 8.7, noise: 8.4, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 77, wet_braking: 82, handling: 80, snow_traction: 93, ice_braking: 86, fuel_economy: 82, tread_life: 82, cr_overall: 86 } },
            "2026": { sales: 41.0, tirerack: { dry_traction: 8.8, wet_traction: 9.0, hydroplaning: 8.8, comfort: 8.7, noise: 8.4, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 77, wet_braking: 82, handling: 80, snow_traction: 94, ice_braking: 87, fuel_economy: 82, tread_life: 82, cr_overall: 87 } }
        }
    },
    {
        brand: "Pirelli",
        model: "Scorpion All Terrain Plus",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 12.5, tirerack: { dry_traction: 8.6, wet_traction: 8.2, hydroplaning: 8.1, comfort: 8.3, noise: 7.9, treadwear: 8.4, user_rating: 8.5 }, consumerreports: { dry_braking: 74, wet_braking: 73, handling: 72, snow_traction: 82, ice_braking: 60, fuel_economy: 76, tread_life: 84, cr_overall: 75 } },
            "2022": { sales: 11.2, tirerack: { dry_traction: 8.6, wet_traction: 8.2, hydroplaning: 8.1, comfort: 8.3, noise: 7.9, treadwear: 8.4, user_rating: 8.5 }, consumerreports: { dry_braking: 74, wet_braking: 73, handling: 72, snow_traction: 82, ice_braking: 60, fuel_economy: 76, tread_life: 84, cr_overall: 76 } },
            "2023": { sales: 10.8, tirerack: { dry_traction: 8.7, wet_traction: 8.3, hydroplaning: 8.2, comfort: 8.4, noise: 8.0, treadwear: 8.5, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 74, handling: 73, snow_traction: 83, ice_braking: 61, fuel_economy: 77, tread_life: 85, cr_overall: 77 } },
            "2024": { sales: 12.8, tirerack: { dry_traction: 8.7, wet_traction: 8.3, hydroplaning: 8.2, comfort: 8.4, noise: 8.0, treadwear: 8.5, user_rating: 8.6 }, consumerreports: { dry_braking: 75, wet_braking: 74, handling: 73, snow_traction: 83, ice_braking: 61, fuel_economy: 77, tread_life: 85, cr_overall: 78 } },
            "2025": { sales: 14.5, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.3, comfort: 8.5, noise: 8.1, treadwear: 8.6, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 75, handling: 74, snow_traction: 84, ice_braking: 62, fuel_economy: 78, tread_life: 86, cr_overall: 79 } },
            "2026": { sales: 16.2, tirerack: { dry_traction: 8.8, wet_traction: 8.4, hydroplaning: 8.3, comfort: 8.5, noise: 8.1, treadwear: 8.6, user_rating: 8.7 }, consumerreports: { dry_braking: 76, wet_braking: 75, handling: 74, snow_traction: 84, ice_braking: 62, fuel_economy: 78, tread_life: 86, cr_overall: 80 } }
        }
    },
    {
        brand: "Goodyear",
        model: "Eagle F1 Asymmetric 6",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 68.5, tirerack: { dry_traction: 9.5, wet_traction: 9.3, hydroplaning: 9.1, comfort: 8.6, noise: 8.3, treadwear: 8.0, user_rating: 9.1 }, consumerreports: { dry_braking: 94, wet_braking: 90, handling: 94, snow_traction: 38, ice_braking: 30, fuel_economy: 76, tread_life: 80, cr_overall: 87 } },
            "2022": { sales: 62.4, tirerack: { dry_traction: 9.5, wet_traction: 9.3, hydroplaning: 9.1, comfort: 8.6, noise: 8.3, treadwear: 8.0, user_rating: 9.1 }, consumerreports: { dry_braking: 94, wet_braking: 90, handling: 94, snow_traction: 38, ice_braking: 30, fuel_economy: 76, tread_life: 80, cr_overall: 88 } },
            "2023": { sales: 58.2, tirerack: { dry_traction: 9.6, wet_traction: 9.4, hydroplaning: 9.2, comfort: 8.7, noise: 8.4, treadwear: 8.1, user_rating: 9.2 }, consumerreports: { dry_braking: 95, wet_braking: 91, handling: 95, snow_traction: 39, ice_braking: 31, fuel_economy: 77, tread_life: 81, cr_overall: 89 } },
            "2024": { sales: 67.0, tirerack: { dry_traction: 9.6, wet_traction: 9.4, hydroplaning: 9.2, comfort: 8.7, noise: 8.4, treadwear: 8.1, user_rating: 9.2 }, consumerreports: { dry_braking: 95, wet_braking: 91, handling: 95, snow_traction: 39, ice_braking: 31, fuel_economy: 77, tread_life: 81, cr_overall: 90 } },
            "2025": { sales: 76.5, tirerack: { dry_traction: 9.7, wet_traction: 9.5, hydroplaning: 9.3, comfort: 8.8, noise: 8.5, treadwear: 8.2, user_rating: 9.3 }, consumerreports: { dry_braking: 96, wet_braking: 92, handling: 96, snow_traction: 40, ice_braking: 32, fuel_economy: 78, tread_life: 82, cr_overall: 91 } },
            "2026": { sales: 85.4, tirerack: { dry_traction: 9.7, wet_traction: 9.5, hydroplaning: 9.3, comfort: 8.8, noise: 8.5, treadwear: 8.2, user_rating: 9.3 }, consumerreports: { dry_braking: 96, wet_braking: 92, handling: 96, snow_traction: 40, ice_braking: 32, fuel_economy: 78, tread_life: 82, cr_overall: 92 } }
        }
    },
    {
        brand: "Goodyear",
        model: "Assurance ComfortDrive",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 85.2, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.5, noise: 9.3, treadwear: 8.8, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 75, ice_braking: 65, fuel_economy: 82, tread_life: 90, cr_overall: 84 } },
            "2022": { sales: 78.4, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.5, noise: 9.3, treadwear: 8.8, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 75, ice_braking: 65, fuel_economy: 82, tread_life: 90, cr_overall: 85 } },
            "2023": { sales: 75.0, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 8.9, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 84, snow_traction: 76, ice_braking: 66, fuel_economy: 83, tread_life: 91, cr_overall: 86 } },
            "2024": { sales: 84.8, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 8.9, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 84, snow_traction: 76, ice_braking: 66, fuel_economy: 83, tread_life: 91, cr_overall: 87 } },
            "2025": { sales: 95.0, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.7, noise: 9.5, treadwear: 9.0, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 77, ice_braking: 67, fuel_economy: 84, tread_life: 92, cr_overall: 88 } },
            "2026": { sales: 105.8, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.7, noise: 9.5, treadwear: 9.0, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 77, ice_braking: 67, fuel_economy: 84, tread_life: 92, cr_overall: 89 } }
        }
    },
    {
        brand: "Goodyear",
        model: "UltraGrip Performance 3",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 35.4, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.7, comfort: 8.7, noise: 8.4, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 73, wet_braking: 78, handling: 76, snow_traction: 94, ice_braking: 90, fuel_economy: 80, tread_life: 82, cr_overall: 82 } },
            "2022": { sales: 31.8, tirerack: { dry_traction: 8.4, wet_traction: 8.6, hydroplaning: 8.7, comfort: 8.7, noise: 8.4, treadwear: 8.4, user_rating: 8.8 }, consumerreports: { dry_braking: 73, wet_braking: 78, handling: 76, snow_traction: 94, ice_braking: 90, fuel_economy: 80, tread_life: 82, cr_overall: 83 } },
            "2023": { sales: 30.2, tirerack: { dry_traction: 8.5, wet_traction: 8.7, hydroplaning: 8.8, comfort: 8.8, noise: 8.5, treadwear: 8.5, user_rating: 8.9 }, consumerreports: { dry_braking: 74, wet_braking: 79, handling: 77, snow_traction: 95, ice_braking: 91, fuel_economy: 81, tread_life: 83, cr_overall: 84 } },
            "2024": { sales: 35.0, tirerack: { dry_traction: 8.5, wet_traction: 8.7, hydroplaning: 8.8, comfort: 8.8, noise: 8.5, treadwear: 8.5, user_rating: 8.9 }, consumerreports: { dry_braking: 74, wet_braking: 79, handling: 77, snow_traction: 95, ice_braking: 91, fuel_economy: 81, tread_life: 83, cr_overall: 85 } },
            "2025": { sales: 39.5, tirerack: { dry_traction: 8.6, wet_traction: 8.8, hydroplaning: 8.9, comfort: 8.9, noise: 8.6, treadwear: 8.6, user_rating: 9.0 }, consumerreports: { dry_braking: 75, wet_braking: 80, handling: 78, snow_traction: 95, ice_braking: 91, fuel_economy: 82, tread_life: 84, cr_overall: 86 } },
            "2026": { sales: 44.2, tirerack: { dry_traction: 8.6, wet_traction: 8.8, hydroplaning: 8.9, comfort: 8.9, noise: 8.6, treadwear: 8.6, user_rating: 9.0 }, consumerreports: { dry_braking: 75, wet_braking: 80, handling: 78, snow_traction: 96, ice_braking: 92, fuel_economy: 82, tread_life: 84, cr_overall: 87 } }
        }
    },
    {
        brand: "Kumho",
        model: "Ecsta PS71",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 52.4, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.5, comfort: 8.2, noise: 8.0, treadwear: 7.6, user_rating: 8.3 }, consumerreports: { dry_braking: 91, wet_braking: 84, handling: 89, snow_traction: 30, ice_braking: 25, fuel_economy: 75, tread_life: 74, cr_overall: 78 } },
            "2022": { sales: 48.2, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.5, comfort: 8.2, noise: 8.0, treadwear: 7.6, user_rating: 8.3 }, consumerreports: { dry_braking: 91, wet_braking: 84, handling: 89, snow_traction: 30, ice_braking: 25, fuel_economy: 75, tread_life: 74, cr_overall: 79 } },
            "2023": { sales: 45.0, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.6, comfort: 8.3, noise: 8.1, treadwear: 7.7, user_rating: 8.4 }, consumerreports: { dry_braking: 92, wet_braking: 85, handling: 90, snow_traction: 31, ice_braking: 26, fuel_economy: 76, tread_life: 75, cr_overall: 80 } },
            "2024": { sales: 51.8, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.6, comfort: 8.3, noise: 8.1, treadwear: 7.7, user_rating: 8.4 }, consumerreports: { dry_braking: 92, wet_braking: 85, handling: 90, snow_traction: 31, ice_braking: 26, fuel_economy: 76, tread_life: 75, cr_overall: 81 } },
            "2025": { sales: 58.5, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 8.7, comfort: 8.4, noise: 8.2, treadwear: 7.8, user_rating: 8.5 }, consumerreports: { dry_braking: 93, wet_braking: 86, handling: 91, snow_traction: 32, ice_braking: 27, fuel_economy: 77, tread_life: 76, cr_overall: 82 } },
            "2026": { sales: 66.0, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 8.7, comfort: 8.4, noise: 8.2, treadwear: 7.8, user_rating: 8.5 }, consumerreports: { dry_braking: 93, wet_braking: 86, handling: 91, snow_traction: 32, ice_braking: 27, fuel_economy: 77, tread_life: 76, cr_overall: 83 } }
        }
    },
    {
        brand: "Kumho",
        model: "Solus TA51a",
        segment: "Grand Touring (All-Season)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 65.1, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.4, comfort: 9.1, noise: 8.9, treadwear: 8.5, user_rating: 8.5 }, consumerreports: { dry_braking: 81, wet_braking: 80, handling: 80, snow_traction: 72, ice_braking: 60, fuel_economy: 82, tread_life: 82, cr_overall: 78 } },
            "2022": { sales: 60.2, tirerack: { dry_traction: 8.7, wet_traction: 8.4, hydroplaning: 8.4, comfort: 9.1, noise: 8.9, treadwear: 8.5, user_rating: 8.5 }, consumerreports: { dry_braking: 81, wet_braking: 80, handling: 80, snow_traction: 72, ice_braking: 60, fuel_economy: 82, tread_life: 82, cr_overall: 79 } },
            "2023": { sales: 58.0, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.5, comfort: 9.2, noise: 9.0, treadwear: 8.6, user_rating: 8.6 }, consumerreports: { dry_braking: 82, wet_braking: 81, handling: 81, snow_traction: 73, ice_braking: 61, fuel_economy: 83, tread_life: 83, cr_overall: 80 } },
            "2024": { sales: 66.5, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.5, comfort: 9.2, noise: 9.0, treadwear: 8.6, user_rating: 8.6 }, consumerreports: { dry_braking: 82, wet_braking: 81, handling: 81, snow_traction: 73, ice_braking: 61, fuel_economy: 83, tread_life: 83, cr_overall: 81 } },
            "2025": { sales: 74.8, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.6, comfort: 9.3, noise: 9.1, treadwear: 8.7, user_rating: 8.7 }, consumerreports: { dry_braking: 83, wet_braking: 82, handling: 82, snow_traction: 74, ice_braking: 62, fuel_economy: 84, tread_life: 84, cr_overall: 82 } },
            "2026": { sales: 83.5, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.6, comfort: 9.3, noise: 9.1, treadwear: 8.7, user_rating: 8.7 }, consumerreports: { dry_braking: 83, wet_braking: 82, handling: 82, snow_traction: 74, ice_braking: 62, fuel_economy: 84, tread_life: 84, cr_overall: 83 } }
        }
    },
    {
        brand: "Kumho",
        model: "WinterCraft WP72",
        segment: "Winter / Snow",
        season: "Winter",
        yearlyData: {
            "2021": { sales: 28.5, tirerack: { dry_traction: 8.0, wet_traction: 8.2, hydroplaning: 8.4, comfort: 8.6, noise: 8.3, treadwear: 8.4, user_rating: 8.7 }, consumerreports: { dry_braking: 72, wet_braking: 78, handling: 76, snow_traction: 92, ice_braking: 88, fuel_economy: 80, tread_life: 82, cr_overall: 79 } },
            "2022": { sales: 25.4, tirerack: { dry_traction: 8.0, wet_traction: 8.2, hydroplaning: 8.4, comfort: 8.6, noise: 8.3, treadwear: 8.4, user_rating: 8.7 }, consumerreports: { dry_braking: 72, wet_braking: 78, handling: 76, snow_traction: 92, ice_braking: 88, fuel_economy: 80, tread_life: 82, cr_overall: 80 } },
            "2023": { sales: 24.0, tirerack: { dry_traction: 8.1, wet_traction: 8.3, hydroplaning: 8.5, comfort: 8.7, noise: 8.4, treadwear: 8.5, user_rating: 8.8 }, consumerreports: { dry_braking: 73, wet_braking: 79, handling: 77, snow_traction: 93, ice_braking: 89, fuel_economy: 81, tread_life: 83, cr_overall: 81 } },
            "2024": { sales: 28.2, tirerack: { dry_traction: 8.1, wet_traction: 8.3, hydroplaning: 8.5, comfort: 8.7, noise: 8.4, treadwear: 8.5, user_rating: 8.8 }, consumerreports: { dry_braking: 73, wet_braking: 79, handling: 77, snow_traction: 93, ice_braking: 89, fuel_economy: 81, tread_life: 83, cr_overall: 82 } },
            "2025": { sales: 32.0, tirerack: { dry_traction: 8.2, wet_traction: 8.4, hydroplaning: 8.6, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 8.9 }, consumerreports: { dry_braking: 74, wet_braking: 80, handling: 78, snow_traction: 94, ice_braking: 90, fuel_economy: 82, tread_life: 84, cr_overall: 83 } },
            "2026": { sales: 36.4, tirerack: { dry_traction: 8.2, wet_traction: 8.4, hydroplaning: 8.6, comfort: 8.8, noise: 8.5, treadwear: 8.6, user_rating: 8.9 }, consumerreports: { dry_braking: 74, wet_braking: 80, handling: 78, snow_traction: 94, ice_braking: 90, fuel_economy: 82, tread_life: 84, cr_overall: 84 } }
        }
    },
    {
        brand: "Kumho",
        model: "Road Venture AT52",
        segment: "All-Terrain (SUV/Truck)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 18.4, tirerack: { dry_traction: 8.5, wet_traction: 8.0, hydroplaning: 8.0, comfort: 8.2, noise: 7.6, treadwear: 8.5, user_rating: 8.4 }, consumerreports: { dry_braking: 76, wet_braking: 74, handling: 73, snow_traction: 82, ice_braking: 58, fuel_economy: 76, tread_life: 84, cr_overall: 75 } },
            "2022": { sales: 16.8, tirerack: { dry_traction: 8.5, wet_traction: 8.0, hydroplaning: 8.0, comfort: 8.2, noise: 7.6, treadwear: 8.5, user_rating: 8.4 }, consumerreports: { dry_braking: 76, wet_braking: 74, handling: 73, snow_traction: 82, ice_braking: 58, fuel_economy: 76, tread_life: 84, cr_overall: 76 } },
            "2023": { sales: 15.5, tirerack: { dry_traction: 8.6, wet_traction: 8.1, hydroplaning: 8.1, comfort: 8.3, noise: 7.7, treadwear: 8.6, user_rating: 8.5 }, consumerreports: { dry_braking: 77, wet_braking: 75, handling: 74, snow_traction: 83, ice_braking: 59, fuel_economy: 77, tread_life: 85, cr_overall: 77 } },
            "2024": { sales: 18.5, tirerack: { dry_traction: 8.6, wet_traction: 8.1, hydroplaning: 8.1, comfort: 8.3, noise: 7.7, treadwear: 8.6, user_rating: 8.5 }, consumerreports: { dry_braking: 82, wet_braking: 75, handling: 74, snow_traction: 83, ice_braking: 59, fuel_economy: 77, tread_life: 85, cr_overall: 78 } },
            "2025": { sales: 21.0, tirerack: { dry_traction: 8.7, wet_traction: 8.2, hydroplaning: 8.2, comfort: 8.4, noise: 7.8, treadwear: 8.7, user_rating: 8.6 }, consumerreports: { dry_braking: 83, wet_braking: 76, handling: 75, snow_traction: 84, ice_braking: 60, fuel_economy: 78, tread_life: 86, cr_overall: 79 } },
            "2026": { sales: 24.2, tirerack: { dry_traction: 8.7, wet_traction: 8.2, hydroplaning: 8.2, comfort: 8.4, noise: 7.8, treadwear: 8.7, user_rating: 8.6 }, consumerreports: { dry_braking: 83, wet_braking: 76, handling: 75, snow_traction: 84, ice_braking: 60, fuel_economy: 78, tread_life: 86, cr_overall: 80 } }
        }
    }
];

// =============================================================
// 3. 글로벌 유럽 테스트 데이터 동적 확장 엔진 (ADAC & Auto Bild)
// =============================================================
(function() {
    TIRE_DATABASE.forEach(model => {
        const brand = model.brand;
        Object.keys(model.yearlyData).forEach(year => {
            const yearRec = model.yearlyData[year];
            const tr = yearRec.tirerack;
            const cr = yearRec.consumerreports;
            
            // -------------------------------------------------------------
            // ADAC 독일 자동차 연맹 학점 등급 (1.0~5.0, 낮을수록 우수)
            // -------------------------------------------------------------
            let dry_safety = 6.0 - (tr.dry_traction + cr.dry_braking / 10.0) / 4.0;
            let wet_safety = 6.0 - (tr.wet_traction + tr.hydroplaning + cr.wet_braking / 10.0) / 6.0;
            let mileage = 6.0 - (tr.treadwear + cr.tread_life / 10.0) / 4.0;
            let efficiency = 6.0 - (cr.fuel_economy / 10.0) / 2.0;
            let noise = 6.0 - (tr.noise + tr.comfort) / 4.0;
            
            // 독일 전문지 특성 반영 브랜드 미세조정
            let brandAdjustment = 0;
            if (brand === 'Michelin' || brand === 'Continental') {
                brandAdjustment = -0.15; // 미쉐린/콘티넨탈: 프리미엄 밸런스 우수성으로 등급 보정
            } else if (brand === 'Hankook') {
                brandAdjustment = -0.10; // 한국타이어: Ventus/Kinergy 브랜드의 유럽 최상위 테스트 결과 연계
            } else if (brand === 'Kumho') {
                brandAdjustment = 0.20;  // 금호타이어: 합리적 가격대, 정밀 지표 소폭 보조
            }
            
            dry_safety = Math.max(1.0, Math.min(5.0, parseFloat((dry_safety + brandAdjustment).toFixed(1))));
            wet_safety = Math.max(1.0, Math.min(5.0, parseFloat((wet_safety + brandAdjustment).toFixed(1))));
            mileage = Math.max(1.0, Math.min(5.0, parseFloat((mileage + brandAdjustment * 0.5).toFixed(1))));
            efficiency = Math.max(1.0, Math.min(5.0, parseFloat(efficiency.toFixed(1))));
            noise = Math.max(1.0, Math.min(5.0, parseFloat(noise.toFixed(1))));
            
            // ADAC 가중평가 산식: 주행안전성(건조+습조) 70% + 친환경밸런스(수명+연비+소음) 30%
            const safety_avg = (dry_safety + wet_safety) / 2;
            const env_avg = (mileage + efficiency + noise) / 3;
            let overall_grade = safety_avg * 0.7 + env_avg * 0.3;
            overall_grade = Math.max(1.0, Math.min(5.0, parseFloat(overall_grade.toFixed(1))));
            
            // -------------------------------------------------------------
            // Auto Bild 독일 잡지 정성 등급 (2.0~10.0, 높을수록 우수)
            // -------------------------------------------------------------
            let dry_performance = (tr.dry_traction + cr.dry_braking / 10.0) / 2.0;
            let wet_performance = (tr.wet_traction + cr.wet_braking / 10.0) / 2.0;
            let aquaplaning = tr.hydroplaning;
            let comfort = (tr.comfort + tr.noise) / 2.0;
            let treadwear = (tr.treadwear + cr.tread_life / 10.0) / 2.0;
            
            const abBrandAdj = -brandAdjustment * 2.0;
            dry_performance = Math.max(2.0, Math.min(10.0, parseFloat((dry_performance + abBrandAdj).toFixed(1))));
            wet_performance = Math.max(2.0, Math.min(10.0, parseFloat((wet_performance + abBrandAdj).toFixed(1))));
            aquaplaning = Math.max(2.0, Math.min(10.0, parseFloat((aquaplaning + abBrandAdj * 0.5).toFixed(1))));
            comfort = Math.max(2.0, Math.min(10.0, parseFloat(comfort.toFixed(1))));
            treadwear = Math.max(2.0, Math.min(10.0, parseFloat((treadwear + abBrandAdj * 0.5).toFixed(1))));
            
            const abAvg = (dry_performance + wet_performance + aquaplaning + comfort + treadwear) / 5;
            let overall_rating = 'Sufficient'; // 충분 (65점)
            if (abAvg >= 9.0) overall_rating = 'Exemplary';     // 최우수 (Vorbildlich, 95점)
            else if (abAvg >= 8.2) overall_rating = 'Good';     // 우수 (Gut, 85점)
            else if (abAvg >= 7.3) overall_rating = 'Satisfactory'; // 만족 (Befriedigend, 75점)
            
            yearRec.europe = {
                adac: {
                    dry_safety,
                    wet_safety,
                    mileage,
                    efficiency,
                    noise,
                    overall_grade
                },
                autobild: {
                    dry_performance,
                    wet_performance,
                    aquaplaning,
                    comfort,
                    treadwear,
                    overall_rating
                }
            };
        });
    });
})();

// Export database globally
window.TIRE_DATABASE = TIRE_DATABASE;
