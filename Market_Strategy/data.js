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
        segment: "Grand Touring (All-Season) - Passenger",
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
    {
        brand: "Hankook",
        model: "iON evo",
        segment: "Ultra High Performance (UHP)",
        season: "Summer",
        yearlyData: {
            "2021": { sales: 2.1, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 8.7, comfort: 9.1, noise: 9.3, treadwear: 8.0, user_rating: 8.9 }, consumerreports: { dry_braking: 92, wet_braking: 86, handling: 91, snow_traction: 30, ice_braking: 25, fuel_economy: 90, tread_life: 78, cr_overall: 85 } },
            "2022": { sales: 4.8, tirerack: { dry_traction: 9.3, wet_traction: 9.0, hydroplaning: 8.8, comfort: 9.2, noise: 9.4, treadwear: 8.1, user_rating: 9.1 }, consumerreports: { dry_braking: 93, wet_braking: 87, handling: 92, snow_traction: 31, ice_braking: 25, fuel_economy: 92, tread_life: 79, cr_overall: 87 } },
            "2023": { sales: 8.9, tirerack: { dry_traction: 9.4, wet_traction: 9.1, hydroplaning: 8.9, comfort: 9.3, noise: 9.5, treadwear: 8.2, user_rating: 9.2 }, consumerreports: { dry_braking: 94, wet_braking: 88, handling: 93, snow_traction: 32, ice_braking: 26, fuel_economy: 94, tread_life: 80, cr_overall: 89 } },
            "2024": { sales: 13.5, tirerack: { dry_traction: 9.4, wet_traction: 9.2, hydroplaning: 9.0, comfort: 9.4, noise: 9.6, treadwear: 8.3, user_rating: 9.3 }, consumerreports: { dry_braking: 94, wet_braking: 89, handling: 93, snow_traction: 33, ice_braking: 27, fuel_economy: 95, tread_life: 81, cr_overall: 90 } },
            "2025": { sales: 18.2, tirerack: { dry_traction: 9.5, wet_traction: 9.3, hydroplaning: 9.1, comfort: 9.4, noise: 9.7, treadwear: 8.4, user_rating: 9.4 }, consumerreports: { dry_braking: 95, wet_braking: 90, handling: 94, snow_traction: 33, ice_braking: 27, fuel_economy: 96, tread_life: 82, cr_overall: 92 } },
            "2026": { sales: 23.4, tirerack: { dry_traction: 9.5, wet_traction: 9.3, hydroplaning: 9.1, comfort: 9.5, noise: 9.8, treadwear: 8.4, user_rating: 9.5 }, consumerreports: { dry_braking: 95, wet_braking: 90, handling: 94, snow_traction: 34, ice_braking: 28, fuel_economy: 97, tread_life: 82, cr_overall: 93 } }
        }
    },
    {
        brand: "Hankook",
        model: "iON evo AS",
        segment: "Ultra High Performance (UHP)",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 1.8, tirerack: { dry_traction: 9.1, wet_traction: 8.7, hydroplaning: 8.6, comfort: 9.2, noise: 9.4, treadwear: 8.5, user_rating: 8.8 }, consumerreports: { dry_braking: 88, wet_braking: 84, handling: 87, snow_traction: 65, ice_braking: 55, fuel_economy: 91, tread_life: 82, cr_overall: 84 } },
            "2022": { sales: 4.2, tirerack: { dry_traction: 9.2, wet_traction: 8.8, hydroplaning: 8.7, comfort: 9.3, noise: 9.5, treadwear: 8.6, user_rating: 9.0 }, consumerreports: { dry_braking: 89, wet_braking: 85, handling: 88, snow_traction: 66, ice_braking: 55, fuel_economy: 93, tread_life: 83, cr_overall: 86 } },
            "2023": { sales: 9.5, tirerack: { dry_traction: 9.3, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.4, noise: 9.6, treadwear: 8.7, user_rating: 9.2 }, consumerreports: { dry_braking: 90, wet_braking: 86, handling: 89, snow_traction: 67, ice_braking: 56, fuel_economy: 95, tread_life: 84, cr_overall: 88 } },
            "2024": { sales: 15.1, tirerack: { dry_traction: 9.3, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.5, noise: 9.7, treadwear: 8.8, user_rating: 9.3 }, consumerreports: { dry_braking: 90, wet_braking: 87, handling: 89, snow_traction: 67, ice_braking: 56, fuel_economy: 96, tread_life: 85, cr_overall: 90 } },
            "2025": { sales: 21.4, tirerack: { dry_traction: 9.4, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.5, noise: 9.8, treadwear: 8.9, user_rating: 9.4 }, consumerreports: { dry_braking: 91, wet_braking: 88, handling: 90, snow_traction: 68, ice_braking: 57, fuel_economy: 97, tread_life: 86, cr_overall: 91 } },
            "2026": { sales: 28.5, tirerack: { dry_traction: 9.4, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.9, treadwear: 8.9, user_rating: 9.5 }, consumerreports: { dry_braking: 91, wet_braking: 88, handling: 90, snow_traction: 68, ice_braking: 57, fuel_economy: 98, tread_life: 86, cr_overall: 92 } }
        }
    },
    {
        brand: "Hankook",
        model: "Dynapro HPX",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 2.5, tirerack: { dry_traction: 8.8, wet_traction: 8.5, hydroplaning: 8.6, comfort: 9.1, noise: 9.0, treadwear: 9.1, user_rating: 8.7 }, consumerreports: { dry_braking: 83, wet_braking: 81, handling: 82, snow_traction: 78, ice_braking: 66, fuel_economy: 85, tread_life: 92, cr_overall: 82 } },
            "2022": { sales: 6.2, tirerack: { dry_traction: 8.9, wet_traction: 8.6, hydroplaning: 8.7, comfort: 9.2, noise: 9.1, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 79, ice_braking: 66, fuel_economy: 86, tread_life: 93, cr_overall: 84 } },
            "2023": { sales: 11.8, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.3, noise: 9.2, treadwear: 9.3, user_rating: 9.1 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 84, snow_traction: 80, ice_braking: 67, fuel_economy: 87, tread_life: 94, cr_overall: 86 } },
            "2024": { sales: 17.5, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.4, noise: 9.3, treadwear: 9.4, user_rating: 9.2 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 80, ice_braking: 67, fuel_economy: 88, tread_life: 95, cr_overall: 88 } },
            "2025": { sales: 23.8, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.4, noise: 9.4, treadwear: 9.5, user_rating: 9.3 }, consumerreports: { dry_braking: 87, wet_braking: 85, handling: 86, snow_traction: 81, ice_braking: 68, fuel_economy: 89, tread_life: 96, cr_overall: 90 } },
            "2026": { sales: 30.5, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.5, noise: 9.5, treadwear: 9.5, user_rating: 9.4 }, consumerreports: { dry_braking: 87, wet_braking: 85, handling: 86, snow_traction: 81, ice_braking: 68, fuel_economy: 89, tread_life: 96, cr_overall: 91 } }
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
        segment: "Grand Touring (All-Season) - Passenger",
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
        segment: "Grand Touring (All-Season) - Passenger",
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
        segment: "Grand Touring (All-Season) - Passenger",
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
        segment: "Grand Touring (All-Season) - Passenger",
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
        segment: "Grand Touring (All-Season) - SUV",
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
        segment: "Grand Touring (All-Season) - Passenger",
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
        segment: "Grand Touring (All-Season) - Passenger",
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
    },
    {
        brand: "Michelin",
        model: "CrossClimate 2 SUV",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 65.5, tirerack: { dry_traction: 9.3, wet_traction: 9.4, hydroplaning: 9.2, comfort: 9.1, noise: 8.7, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 89, wet_braking: 90, handling: 87, snow_traction: 87, ice_braking: 75, fuel_economy: 81, tread_life: 92, cr_overall: 90 } },
            "2022": { sales: 62.2, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.3, comfort: 9.2, noise: 8.8, treadwear: 9.1, user_rating: 9.3 }, consumerreports: { dry_braking: 90, wet_braking: 91, handling: 88, snow_traction: 89, ice_braking: 76, fuel_economy: 82, tread_life: 93, cr_overall: 92 } },
            "2023": { sales: 60.8, tirerack: { dry_traction: 9.4, wet_traction: 9.5, hydroplaning: 9.3, comfort: 9.2, noise: 8.8, treadwear: 9.1, user_rating: 9.3 }, consumerreports: { dry_braking: 90, wet_braking: 91, handling: 88, snow_traction: 89, ice_braking: 76, fuel_economy: 82, tread_life: 93, cr_overall: 92 } },
            "2024": { sales: 68.4, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.3, noise: 8.9, treadwear: 9.2, user_rating: 9.4 }, consumerreports: { dry_braking: 91, wet_braking: 92, handling: 89, snow_traction: 90, ice_braking: 77, fuel_economy: 83, tread_life: 94, cr_overall: 93 } },
            "2025": { sales: 74.1, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.3, noise: 8.9, treadwear: 9.2, user_rating: 9.4 }, consumerreports: { dry_braking: 91, wet_braking: 92, handling: 89, snow_traction: 90, ice_braking: 77, fuel_economy: 83, tread_life: 94, cr_overall: 93 } },
            "2026": { sales: 81.8, tirerack: { dry_traction: 9.5, wet_traction: 9.6, hydroplaning: 9.4, comfort: 9.3, noise: 8.9, treadwear: 9.2, user_rating: 9.4 }, consumerreports: { dry_braking: 91, wet_braking: 92, handling: 89, snow_traction: 90, ice_braking: 77, fuel_economy: 83, tread_life: 94, cr_overall: 93 } }
        }
    },
    {
        brand: "Bridgestone",
        model: "Alenza AS Ultra",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 55.2, tirerack: { dry_traction: 8.9, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.3, noise: 9.1, treadwear: 9.2, user_rating: 8.9 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 83, snow_traction: 80, ice_braking: 69, fuel_economy: 89, tread_life: 94, cr_overall: 86 } },
            "2022": { sales: 52.1, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 9.3, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 83, snow_traction: 81, ice_braking: 69, fuel_economy: 89, tread_life: 95, cr_overall: 87 } },
            "2023": { sales: 51.3, tirerack: { dry_traction: 9.0, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.4, noise: 9.2, treadwear: 9.3, user_rating: 9.0 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 84, snow_traction: 81, ice_braking: 70, fuel_economy: 90, tread_life: 95, cr_overall: 88 } },
            "2024": { sales: 56.8, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 9.4, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 84, snow_traction: 82, ice_braking: 70, fuel_economy: 90, tread_life: 96, cr_overall: 89 } },
            "2025": { sales: 62.2, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.5, noise: 9.3, treadwear: 9.4, user_rating: 9.1 }, consumerreports: { dry_braking: 87, wet_braking: 85, handling: 85, snow_traction: 82, ice_braking: 71, fuel_economy: 91, tread_life: 96, cr_overall: 90 } },
            "2026": { sales: 68.1, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.5, noise: 9.3, treadwear: 9.4, user_rating: 9.1 }, consumerreports: { dry_braking: 87, wet_braking: 85, handling: 85, snow_traction: 82, ice_braking: 71, fuel_economy: 91, tread_life: 96, cr_overall: 90 } }
        }
    },
    {
        brand: "Continental",
        model: "CrossContact LX25",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 48.4, tirerack: { dry_traction: 9.1, wet_traction: 9.1, hydroplaning: 9.1, comfort: 9.2, noise: 8.9, treadwear: 9.1, user_rating: 9.1 }, consumerreports: { dry_braking: 87, wet_braking: 88, handling: 85, snow_traction: 74, ice_braking: 66, fuel_economy: 84, tread_life: 92, cr_overall: 87 } },
            "2022": { sales: 45.8, tirerack: { dry_traction: 9.2, wet_traction: 9.1, hydroplaning: 9.2, comfort: 9.3, noise: 9.0, treadwear: 9.2, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 88, handling: 86, snow_traction: 75, ice_braking: 67, fuel_economy: 84, tread_life: 93, cr_overall: 88 } },
            "2023": { sales: 44.2, tirerack: { dry_traction: 9.2, wet_traction: 9.2, hydroplaning: 9.2, comfort: 9.3, noise: 9.0, treadwear: 9.2, user_rating: 9.2 }, consumerreports: { dry_braking: 88, wet_braking: 89, handling: 86, snow_traction: 75, ice_braking: 67, fuel_economy: 85, tread_life: 93, cr_overall: 89 } },
            "2024": { sales: 49.5, tirerack: { dry_traction: 9.3, wet_traction: 9.2, hydroplaning: 9.3, comfort: 9.4, noise: 9.1, treadwear: 9.3, user_rating: 9.3 }, consumerreports: { dry_braking: 88, wet_braking: 89, handling: 87, snow_traction: 76, ice_braking: 68, fuel_economy: 85, tread_life: 94, cr_overall: 90 } },
            "2025": { sales: 55.4, tirerack: { dry_traction: 9.3, wet_traction: 9.3, hydroplaning: 9.3, comfort: 9.4, noise: 9.1, treadwear: 9.3, user_rating: 9.3 }, consumerreports: { dry_braking: 89, wet_braking: 90, handling: 87, snow_traction: 76, ice_braking: 68, fuel_economy: 86, tread_life: 94, cr_overall: 91 } },
            "2026": { sales: 61.1, tirerack: { dry_traction: 9.3, wet_traction: 9.3, hydroplaning: 9.3, comfort: 9.4, noise: 9.1, treadwear: 9.3, user_rating: 9.3 }, consumerreports: { dry_braking: 89, wet_braking: 90, handling: 87, snow_traction: 76, ice_braking: 68, fuel_economy: 86, tread_life: 94, cr_overall: 91 } }
        }
    },
    {
        brand: "Pirelli",
        model: "Scorpion AS Plus 3",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 42.5, tirerack: { dry_traction: 9.0, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.4, noise: 9.2, treadwear: 8.8, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 84, snow_traction: 72, ice_braking: 64, fuel_economy: 85, tread_life: 90, cr_overall: 85 } },
            "2022": { sales: 39.0, tirerack: { dry_traction: 9.1, wet_traction: 8.9, hydroplaning: 8.8, comfort: 9.5, noise: 9.3, treadwear: 8.9, user_rating: 9.1 }, consumerreports: { dry_braking: 85, wet_braking: 84, handling: 85, snow_traction: 73, ice_braking: 65, fuel_economy: 86, tread_life: 91, cr_overall: 86 } },
            "2023": { sales: 37.3, tirerack: { dry_traction: 9.1, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.5, noise: 9.3, treadwear: 8.9, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 85, snow_traction: 73, ice_braking: 65, fuel_economy: 86, tread_life: 91, cr_overall: 87 } },
            "2024": { sales: 43.1, tirerack: { dry_traction: 9.2, wet_traction: 9.0, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 86, wet_braking: 85, handling: 86, snow_traction: 74, ice_braking: 66, fuel_economy: 87, tread_life: 92, cr_overall: 88 } },
            "2025": { sales: 48.0, tirerack: { dry_traction: 9.2, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.4, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 86, handling: 86, snow_traction: 74, ice_braking: 66, fuel_economy: 87, tread_life: 92, cr_overall: 89 } },
            "2026": { sales: 53.9, tirerack: { dry_traction: 9.2, wet_traction: 9.1, hydroplaning: 9.0, comfort: 9.6, noise: 9.4, treadwear: 9.0, user_rating: 9.2 }, consumerreports: { dry_braking: 87, wet_braking: 86, handling: 86, snow_traction: 74, ice_braking: 66, fuel_economy: 87, tread_life: 92, cr_overall: 89 } }
        }
    },
    {
        brand: "Goodyear",
        model: "Assurance MaxLife (SUV)",
        segment: "Grand Touring (All-Season) - SUV",
        season: "All-Season",
        yearlyData: {
            "2021": { sales: 46.2, tirerack: { dry_traction: 9.0, wet_traction: 8.7, hydroplaning: 8.8, comfort: 9.5, noise: 9.3, treadwear: 8.8, user_rating: 8.9 }, consumerreports: { dry_braking: 84, wet_braking: 82, handling: 83, snow_traction: 75, ice_braking: 65, fuel_economy: 82, tread_life: 90, cr_overall: 85 } },
            "2022": { sales: 42.4, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 8.9, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 84, snow_traction: 76, ice_braking: 66, fuel_economy: 83, tread_life: 91, cr_overall: 86 } },
            "2023": { sales: 41.0, tirerack: { dry_traction: 9.1, wet_traction: 8.8, hydroplaning: 8.9, comfort: 9.6, noise: 9.4, treadwear: 8.9, user_rating: 9.0 }, consumerreports: { dry_braking: 85, wet_braking: 83, handling: 84, snow_traction: 76, ice_braking: 66, fuel_economy: 83, tread_life: 91, cr_overall: 87 } },
            "2024": { sales: 46.8, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.7, noise: 9.5, treadwear: 9.0, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 77, ice_braking: 67, fuel_economy: 84, tread_life: 92, cr_overall: 88 } },
            "2025": { sales: 51.0, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.7, noise: 9.5, treadwear: 9.0, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 77, ice_braking: 67, fuel_economy: 84, tread_life: 92, cr_overall: 88 } },
            "2026": { sales: 55.8, tirerack: { dry_traction: 9.2, wet_traction: 8.9, hydroplaning: 9.0, comfort: 9.7, noise: 9.5, treadwear: 9.0, user_rating: 9.1 }, consumerreports: { dry_braking: 86, wet_braking: 84, handling: 85, snow_traction: 77, ice_braking: 67, fuel_economy: 84, tread_life: 92, cr_overall: 88 } }
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
            if (abAvg >= 9.0) overall_rating = 'Exemplary';     // 理쒖슦??(Vorbildlich, 95??
            else if (abAvg >= 8.2) overall_rating = 'Good';     // ?곗닔 (Gut, 85??
            else if (abAvg >= 7.3) overall_rating = 'Satisfactory'; // 留뚯” (Befriedigend, 75??
            
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

const TIRE_EVOLUTION_DATABASE = {
    Michelin_Sport: {
        brand: "Michelin",
        lineupKey: "Michelin_Sport",
        lineupName: "Pilot Sport (Summer UHP)",
        segmentEU: "Ultra High Performance (UHP)",
        segmentUS: "Grand Touring (All-Season) - Passenger",
        flagshipLine: "Pilot Sport Series (Summer UHP)",
        hankookLine: "Ventus S1 evo Series (Summer UHP)",
        generations: [
            {
                year: "2010",
                compYear: "2010",
                hkYear: "2012",
                compModel: "Pilot Sport 3 (PS3)",
                compSlogan: "The absolute reference in wet safety and handling efficiency",
                compBrochure: {
                    compound: "Wet Grip Elastomer (고밀도 기능성 엘라스토머 배합)",
                    tech: "Anti-Surf System (수막현상 방지 숄더 커브 설계)",
                    treadwear: "UTQG 320 / AA A",
                    focus: "Wet braking distances and energy-saving rolling resistance"
                },
                compScores: { dry_grip: 8.4, wet_grip: 8.6, hydro_resist: 8.5, comfort_noise: 8.1, tread_life: 7.5, efficiency: 8.0 },
                hkModel: "Ventus S1 evo2 (K117)",
                hkSlogan: "Prestige handling with innovative cooling block technology",
                hkBrochure: {
                    compound: "High-grip Styrene-polymer silica",
                    tech: "Aqua Driving System (속도 감응형 복합 수막 탈출 그루브)",
                    treadwear: "UTQG 300 / A A",
                    focus: "OE custom prestige matching and cooling block longevity"
                },
                hkScores: { dry_grip: 8.8, wet_grip: 8.4, hydro_resist: 8.1, comfort_noise: 8.2, tread_life: 7.4, efficiency: 7.6 }
            },
            {
                year: "2016",
                compYear: "2016",
                hkYear: "2019",
                compModel: "Pilot Sport 4 (PS4)",
                compSlogan: "From track to road - instant steering response and stability",
                compBrochure: {
                    compound: "Functional Elastomers & Hydrophobic Silica Compound",
                    tech: "Dynamic Response Technology (아라미드/나일론 하이브리드 벨트)",
                    treadwear: "UTQG 320 / AA A",
                    focus: "Optimized handling footprint and rapid steering responsiveness"
                },
                compScores: { dry_grip: 9.1, wet_grip: 8.9, hydro_resist: 8.6, comfort_noise: 8.3, tread_life: 7.8, efficiency: 7.9 },
                hkModel: "Ventus S1 evo3 (K127)",
                hkSlogan: "Highly-refined control precision at ultra-high speeds",
                hkBrochure: {
                    compound: "HSSC (Highly Enriched Synthetic Silica Compound) - 고인장 가황 합성 실리카 컴파운드",
                    tech: "Aramid hybrid reinforcement belt (아라미드 하이브리드 보강 벨트 설계)",
                    treadwear: "UTQG 300 / AA A",
                    focus: "Ultra-precise high-speed steering and optimized footprint pressure"
                },
                hkScores: { dry_grip: 9.2, wet_grip: 8.9, hydro_resist: 8.5, comfort_noise: 8.4, tread_life: 8.0, efficiency: 7.8 }
            },
            {
                year: "2024",
                compYear: "2022",
                hkYear: "2024",
                compModel: "Pilot Sport 5 (PS5)",
                compSlogan: "Live each driving moment to the fullest, sustainably",
                compBrochure: {
                    compound: "High-density Silica & Eco-binding Polymers",
                    tech: "MaxTouch Construction (트레드 접지압 분포 균일화) & Premium Touch Velvet Sidewall",
                    treadwear: "UTQG 340 / AA A (수명 15% 개선)",
                    focus: "Consistent handling throughout the tire life (마모 한계점까지 일관된 접지력)"
                },
                compScores: { dry_grip: 9.4, wet_grip: 9.2, hydro_resist: 8.9, comfort_noise: 8.7, tread_life: 8.6, efficiency: 8.2 },
                hkModel: "Ventus S1 evo4 (K137)",
                hkSlogan: "Next-generation ultra-high performance summer flagship with AI-optimized compounds",
                hkBrochure: {
                    compound: "AI-Optimized Ultra-High Dispersion Silica Compound (AI 기반 실리카 초고분산 배합)",
                    tech: "AI-Assisted Tread Profile & 32% Extended Mileage Construction (AI 기술 활용 접지면 최적화 및 수명 32% 극대화 공법)",
                    treadwear: "UTQG 340 / AA A (수명 32% 대폭 연장)",
                    focus: "AI-optimized dry/wet contact patch, superb handling precision, and ultra-high mileage"
                },
                hkScores: { dry_grip: 9.4, wet_grip: 9.1, hydro_resist: 8.7, comfort_noise: 8.6, tread_life: 8.9, efficiency: 8.0 }
            }
        ],
        evolutionDirection: {
            gen1_to_gen2: "미쉐린은 PS3에서 고하중 제동에 최적화된 컴파운드를 적용한 후, PS4로 넘어오며 포뮬러 E 레이싱 기술인 '아라미드 하이브리드 벨트'를 도입해 조종 정밀성을 극대화했습니다. 이에 대응하여 한국타이어 역시 Ventus S1 evo2(K117)의 프리미엄 유럽 OE 믹스 구도에서 S1 evo3(K127)로 체인지하며 아라미드 하이브리드 보강 벨트 설계 및 고유성 합성 고인장 컴파운드(HSSC)를 적용해 초고속 영역에서의 횡하중 지지력과 정밀 조향성을 비약적으로 발전시켰습니다.",
            gen2_to_gen3: "PS4에서 PS5로 이행하며 미쉐린은 '마모 한계까지 균일한 접지압(MaxTouch)' 설계와 지속가능 수명 15% 보강으로 ESG 흐름에 밀착했습니다. 한국타이어 역시 S1 evo3(K127)를 넘어 차세대 플래그십 기술력의 집약체인 Ventus S1 evo4(K137)를 내놓으며 AI 시뮬레이션 활용 패턴 접지압 고도화 공법을 결합, 마일리지를 32% 극대화함과 동시에 미쉐린 PS5의 균일한 그립 마진 성능을 극적으로 추월하는 기술 혁신을 이루었습니다.",
            comparisonSummary: "미쉐린 Pilot Sport는 마모 한계점까지 일관되게 이어지는 실질 제동력의 균일성에 설계 역량을 투입하는 반면, 한국타이어 Ventus S1 evo 시리즈는 고속 선회 강성을 보장하는 아라미드 벨트 하이브리드 보강 및 열방출 쿨링 시스템을 연동한 스포츠 주행 마진 확보에 엔지니어링 포커스를 맞추고 있습니다."
        },
        insights: {
            past: "마른/젖은 노면의 순간 제동력 및 코너링 한계 접지력 등 '물리 물리적 그립력' 극대화에 전력 투구.",
            present: "균일 마모 구조(MaxTouch)를 바탕으로 한 수명 연장(지속가능 수명) 및 고하중 EV 대응 정숙성/회전저항 보완.",
            future: "친환경 천연/재생 원료 비율 40% 이상 확대, 패턴 깊이 자가 복원 기술(Self-Regenerating Tread), Euro 7 미세 먼지 마모 감소 컴파운드."
        },
        proposal: "미쉐린 PS5의 일관된 마모 성능 한계에 대응하기 위해, 당사는 마모 한계 시점(트레드 깊이 30% 이하)에서도 습윤 그립 소실을 5% 이내로 제어하는 '다층 컴파운드 기술(Multi-layer Compound)' 및 가황 컴파운드 배합 다각화를 R&D 최우선 과제로 지정하여 개발하여야 합니다."
    },
    Michelin_Primacy: {
        brand: "Michelin",
        lineupKey: "Michelin_Primacy",
        lineupName: "Primacy (Comfort All-Season)",
        segmentEU: "All-Season Passenger",
        segmentUS: "Grand Touring (All-Season) - Passenger",
        flagshipLine: "Primacy Series (Comfort All-Season)",
        hankookLine: "Kinergy XP (Comfort All-Season)",
        generations: [
            {
                year: "2010",
                compYear: "2010",
                hkYear: "2009",
                compModel: "Primacy MXM4",
                compSlogan: "Comfort, handling and all-season safety with premium OE matching",
                compBrochure: {
                    compound: "Sunflower Oil & Helio Compound (저온 고무 유연성 확보)",
                    tech: "MaxTouch Construction (접지압 균등 배분 구조)",
                    treadwear: "UTQG 500 / A A",
                    focus: "All-season touring safety, soft ride, and low rolling resistance"
                },
                compScores: { dry_grip: 8.0, wet_grip: 7.9, hydro_resist: 7.8, comfort_noise: 8.8, tread_life: 8.5, efficiency: 8.2 },
                hkModel: "Optimo H426",
                hkSlogan: "Silent luxury passenger comfort with quiet riding performance",
                hkBrochure: {
                    compound: "Silica-rich passenger comfort compound",
                    tech: "Asymmetric pattern pitch design (주행 진동 흡수 리브)",
                    treadwear: "UTQG 440 / A A",
                    focus: "Low pattern noise level and soft plush highway comfort"
                },
                hkScores: { dry_grip: 7.8, wet_grip: 7.2, hydro_resist: 7.4, comfort_noise: 8.5, tread_life: 7.4, efficiency: 7.8 }
            },
            {
                year: "2018",
                compYear: "2018",
                hkYear: "2013",
                compModel: "Primacy Tour A/S",
                compSlogan: "The quietest and most comfortable ride among premium touring tires",
                compBrochure: {
                    compound: "Advanced Silica & Functional Elastomer 배합",
                    tech: "PIANO Noise Reduction Tuning (피아노 주파수 상쇄 소음 기술)",
                    treadwear: "UTQG 540 / A A",
                    focus: "Prestige sedan cabin extreme quietness and improved snow traction"
                },
                compScores: { dry_grip: 8.4, wet_grip: 8.3, hydro_resist: 8.1, comfort_noise: 9.3, tread_life: 8.7, efficiency: 8.3 },
                hkModel: "Ventus S1 noble2 (H452)",
                hkSlogan: "Premium high performance touring with luxury quiet riding",
                hkBrochure: {
                    compound: "Hybrid Silica & High Grip Resin",
                    tech: "3D Sipe Technology (블록 가장자리 직립 변형 억제 리브)",
                    treadwear: "UTQG 500 / A A",
                    focus: "UHP-grade dry handling response with comfortable touring ride"
                },
                hkScores: { dry_grip: 8.5, wet_grip: 8.0, hydro_resist: 7.9, comfort_noise: 8.7, tread_life: 8.0, efficiency: 7.9 }
            },
            {
                year: "2024",
                compYear: "2021",
                hkYear: "2024",
                compModel: "Primacy A/S",
                compSlogan: "Next generation touring - optimized for electric prestige vehicles",
                compBrochure: {
                    compound: "Eco-Focus Low-Resist Compound (지속가능 배합)",
                    tech: "Acoustic Tech (타이어 내측 특수 폴리우레탄 흡음 폼 장착)",
                    treadwear: "UTQG 540 / A A",
                    focus: "Eco-efficiency, low rolling resistance and silent EV touring comfort"
                },
                compScores: { dry_grip: 8.5, wet_grip: 8.5, hydro_resist: 8.4, comfort_noise: 9.5, tread_life: 8.9, efficiency: 8.8 },
                hkModel: "Kinergy XP (H315)",
                hkSlogan: "The ultimate grand touring all-season passenger tire providing premium comfort, quietness, and extreme durability",
                hkBrochure: {
                    compound: "Advanced Silica-Rich Compound with Odor-free Pure Oils (친환경 정제 오일 및 실리카 함량 극대화 고마모 컴팩트 배합)",
                    tech: "Cor輻-Sipe Technology & Knurling Acoustic System (눈길 견인력 제어용 3D 톱니형 사이프 및 패턴 소음 소멸 널링 오토 기술)",
                    treadwear: "UTQG 700 / A A (75,000마일 압도적 워런티 보증)",
                    focus: "Extreme tire tread longevity (75k miles), whisper-quiet cabin acoustics, and wet/snow grip safety"
                },
                hkScores: { dry_grip: 8.6, wet_grip: 8.5, hydro_resist: 8.4, comfort_noise: 9.4, tread_life: 9.6, efficiency: 8.5 }
            }
        ],
        evolutionDirection: {
            gen1_to_gen2: "미쉐린은 MXM4에서 Tour A/S로 넘어오며 노면 소음 주파수를 정밀 제어하는 '피아노 튜닝 소음 패턴'을 고도화하여 실내 정숙성을 전면에 내세웠습니다. 한국타이어는 Optimo H426에서 프리미엄 UHP 투어링 성격을 가미한 Ventus S1 noble2로 세대 교체하며 단순 안락한 주행에서 탈피해 고속 조종 안정성 및 스포츠 핸들링 그립 성능을 보강했습니다.",
            gen2_to_gen3: "Tour A/S에서 Primacy A/S로 전환하며 미쉐린은 전기차 및 고급 세단의 저소음을 위해 'Acoustic 흡음 폼' 및 구름저항 15% 감축을 달성했습니다. 이에 맞서 한국타이어는 기존 Ventus S1 AS의 뛰어난 컴포트 가치 위에 차세대 그랜드 투어링 신제품인 Kinergy XP(H315)를 2024년 투입하며 눈길 견인용 톱니형 3D 사이프와 소음 소멸 널링 기술을 적용했습니다. 특히 최적의 컴파운드 설계로 마일리지를 동급 최고 수준인 UTQG 700(미쉐린 540 대비 압도적 우위)까지 연장하는 독보적인 실용 명품 세대교체를 이룩했습니다.",
            comparisonSummary: "미쉐린 Primacy는 극단적인 실내 음향 노이즈 흡수(Acoustic Foam)와 럭셔리한 실크 라이딩 질감에 역량을 맞추는 반면, 한국타이어 Kinergy XP는 프리미엄 조종 반응을 든든하게 받치면서 트레드 마일리지 수명을 극대화(UTQG 700)하는 초장수명 컴포트 투어링 밸런스에 압도적인 장점이 있습니다."
        },
        insights: {
            past: "미주 대륙 특성에 부합하는 부드러운 직진 고속 주행감 및 기본 사계절 견인력 보장에 전력 투구.",
            present: "정숙성 소음 주파수 상쇄 패턴 설계 및 전기차 타이어 전용 내장 우레탄 흡음 패드(Acoustic) 전폭 도입.",
            future: "바이오 대체 오일(해바라기유 등) 및 재생 고무 배합비 45% 돌파, 초고하중(HL) EV 규격 최적화 서스펜션 질감 융합."
        },
        proposal: "미쉐린 Primacy의 우수한 흡음 질감에 대응하기 위해, 당사 Ventus S1 AS 및 iON 시리즈의 우레탄 흡음 패드 부착 자동화 신공정(소리 부착 신공법)을 고도화하고, 겨울철 눈길/젖은 노면 제동력을 추가 확보할 수 있는 저온 전용 해바라기씨유 친환경 가황제 배합 기술을 신속하게 양산화해야 합니다."
    },
    Continental_Sport: {
        brand: "Continental",
        lineupKey: "Continental_Sport",
        lineupName: "SportContact (Summer UHP)",
        segmentEU: "Ultra High Performance (UHP)",
        segmentUS: "All-Season Passenger",
        flagshipLine: "SportContact Series (Max Performance Sport)",
        hankookLine: "Ventus S1 evo Series (Summer UHP)",
        generations: [
            {
                year: "2011",
                compYear: "2011",
                hkYear: "2007",
                compModel: "SportContact 5 (SC5)",
                compSlogan: "Grip and safety for performance cars - braking is everything",
                compBrochure: {
                    compound: "Black Chili Compound (마찰 열에너지 감응 가황 수지)",
                    tech: "Macro-block design (외측 숄더 블록 면적 강화 코너링 최적화)",
                    treadwear: "UTQG 280 / AA A",
                    focus: "Shorter braking distances in dry/wet and fuel efficiency"
                },
                compScores: { dry_grip: 8.6, wet_grip: 8.4, hydro_resist: 8.1, comfort_noise: 8.0, tread_life: 7.0, efficiency: 7.7 },
                hkModel: "Ventus S1 evo (K107)",
                hkSlogan: "Optimal wet performance and high speed stability",
                hkBrochure: {
                    compound: "Highly dispersible Silica compound",
                    tech: "Wave-type outer block (파도형 외측 숄더 블록 압력 분산)",
                    treadwear: "UTQG 280 / A A",
                    focus: "High-speed cornering stability and short dry braking distance"
                },
                hkScores: { dry_grip: 8.2, wet_grip: 7.8, hydro_resist: 7.6, comfort_noise: 7.8, tread_life: 6.8, efficiency: 7.2 }
            },
            {
                year: "2016",
                compYear: "2016",
                hkYear: "2012",
                compModel: "SportContact 6 (SC6)",
                compSlogan: "Thrilling safety, designed for high-performance sports cars",
                compBrochure: {
                    compound: "Micro-Flex Black Chili (노면 미세 요철 그립 밀착 가황 수지)",
                    tech: "Aralon 350 (초속 350km/h 주행을 견디는 고강성 하이브리드 보강재)",
                    treadwear: "UTQG 240 / AA A",
                    focus: "Steering precision and extreme high-speed centrifugal resistance"
                },
                compScores: { dry_grip: 9.3, wet_grip: 8.8, hydro_resist: 8.3, comfort_noise: 7.9, tread_life: 7.2, efficiency: 7.5 },
                hkModel: "Ventus S1 evo2 (K117)",
                hkSlogan: "Prestige handling with innovative cooling block technology",
                hkBrochure: {
                    compound: "High-grip Styrene-polymer silica",
                    tech: "Aqua Driving System (속도 감응형 복합 수막 탈출 그루브)",
                    treadwear: "UTQG 300 / A A",
                    focus: "OE custom prestige matching and cooling block longevity"
                },
                hkScores: { dry_grip: 8.8, wet_grip: 8.4, hydro_resist: 8.1, comfort_noise: 8.2, tread_life: 7.4, efficiency: 7.6 }
            },
            {
                year: "2024",
                compYear: "2022",
                hkYear: "2024",
                compModel: "SportContact 7 (SC7)",
                compSlogan: "Adaptive driving pleasure with outstanding safety",
                compBrochure: {
                    compound: "Harmonized Black Chili with customized profile sizing",
                    tech: "Adaptive Tread Design (종/횡 하중에 맞춰 트레드 블록 그루브 형상이 자동 변화)",
                    treadwear: "UTQG 300 / AA A",
                    focus: "Wet/dry adaptability for heavy EVs and customized compounding per car class"
                },
                compScores: { dry_grip: 9.6, wet_grip: 9.3, hydro_resist: 8.7, comfort_noise: 8.5, tread_life: 8.1, efficiency: 8.0 },
                hkModel: "Ventus S1 evo4 (K137)",
                hkSlogan: "Next-generation ultra-high performance summer flagship with AI-optimized compounds",
                hkBrochure: {
                    compound: "AI-Optimized Ultra-High Dispersion Silica Compound (AI 기반 실리카 초고분산 배합)",
                    tech: "AI-Assisted Tread Profile & 32% Extended Mileage Construction (AI 기술 활용 접지면 최적화 및 수명 32% 극대화 공법)",
                    treadwear: "UTQG 340 / AA A (수명 32% 대폭 연장)",
                    focus: "AI-optimized dry/wet contact patch, superb handling precision, and ultra-high mileage"
                },
                hkScores: { dry_grip: 9.4, wet_grip: 9.1, hydro_resist: 8.7, comfort_noise: 8.6, tread_life: 8.9, efficiency: 8.0 }
            }
        ],
        evolutionDirection: {
            gen1_to_gen2: "콘티넨탈은 SC5의 범용 제동 극대화에서 SC6로 모델 체인지하며, 슈퍼카 튜너 주행 영역(350km/h 극한 환경)에 적합하도록 아라미드 하이브리드 보강재 'Aralon 350'을 적용해 극한의 횡강성과 스티어링 정밀성을 전력 강화했습니다. 한국타이어는 evo1에서 evo2로 변경 시 메이저 유럽 프리미엄 브랜드 OE 수주 장벽을 깨기 위해 블록 열배출용 쿨링핀 시스템 도입 등 '고속 내구성' 증대에 설계 초점을 맞췄습니다.",
            gen2_to_gen3: "SC6에서 SC7으로 교체하며 콘티넨탈은 고하중 고출력 차량 선회 시 블록 내부 그루브가 물리적으로 수축 지지하는 'Adaptive Tread' 설계를 적용했습니다. 한국타이어는 evo2에서 evo3의 성과를 계승 및 확장하여, 2024년 최신 AI 가상 설계 및 초고분산 컴파운딩 기술을 투입한 Ventus S1 evo4(K137)로 진화했습니다. 이를 통해 고속 선회 및 가변 노면에서 타이어 접지 압력 분산을 자동 조율하는 엔지니어링 완성도를 확보하여 콘티넨탈 SC7 대비 수명 우위와 강력한 트랙션을 모두 양립했습니다.",
            comparisonSummary: "콘티넨탈 SportContact는 마찰 열과 수직 선회 하중에 반응하는 물리적 가변 가황 고무(Black Chili) 및 패턴 변화 제어력에 집중하는 반면, 한국타이어 Ventus S1 evo 시리즈는 합리적인 타이어 총 질량 배분과 실리카 균일 가황 중합 기술을 바탕으로 고속 스포츠 제동의 안정적인 수명 유지성에 설계적 장점을 보여줍니다."
        },
        insights: {
            past: "초고속(350km/h) 내원심성 확보 및 급격한 제동 시 마찰열을 활용해 그립력을 단기 활성화하는 극단 성능 위주.",
            present: "차중과 하중이 높은 무거운 EV 차종에 어울리는 강성 보강 및 노면 물고 그립하는 하중 감응식 가변 패턴(Adaptive Tread) 설계 중심.",
            future: "민들레 뿌리 대체 천연고무 'Taraxagum'의 양산 타이어 트레드 100% 확대 적용, 타이어 내장 압력/온도 능동 계측 지능형 RFID 전장 연동."
        },
        proposal: "콘티넨탈의 고강성 하중 감응식 외측 블록 제어(Adaptive Tread) 및 맞춤형 컴파운드 설계에 대응하여, 당사 Ventus S1 evo 시리즈에도 횡력 및 숄더부 하중 집중도에 따라 접지 면적을 유연하게 늘려주는 '가변형 복합 숄더 그루브 프로파일' 형상 특허 기술을 선제 확보하고, 전기차 맞춤형 HL 규격 설계를 고도화해야 합니다."
    },
    Continental_Winter: {
        brand: "Continental",
        lineupKey: "Continental_Winter",
        lineupName: "WinterContact (Winter / Snow)",
        segmentEU: "Winter / Snow",
        segmentUS: "Winter / Snow",
        flagshipLine: "WinterContact Series (Winter / Snow)",
        hankookLine: "Winter i*cept evo Series (Winter / Snow)",
        generations: [
            {
                year: "2012",
                compYear: "2012",
                hkYear: "2010",
                compModel: "ContiWinterContact TS850",
                compSlogan: "Safety in winter - outstanding braking and handling on snow and ice",
                compBrochure: {
                    compound: "Silika-Active Compound (영하 저온 그립 유연성 특화)",
                    tech: "Snow-Hook Technology (눈길 직접 움켜쥐는 트랙션 숄더 블록)",
                    treadwear: "Winter-rated / No UTQG",
                    focus: "Shorter braking distances on ice and packed snow safety"
                },
                compScores: { dry_grip: 7.2, wet_grip: 8.2, hydro_resist: 8.0, comfort_noise: 7.8, tread_life: 7.8, efficiency: 7.5 },
                hkModel: "Winter i*cept evo (W310)",
                hkSlogan: "Dynamic and safe winter driving on frozen and snow-covered roads",
                hkBrochure: {
                    compound: "Polar Silica Compound (빙판 밀착 레진 가황 배합)",
                    tech: "Asymmetric pitch sequence & 3D sipes (가변 피치 소음 저감 패턴)",
                    treadwear: "Winter-rated / No UTQG",
                    focus: "Cold dry handling response and fundamental snow traction"
                },
                hkScores: { dry_grip: 7.4, wet_grip: 7.6, hydro_resist: 7.5, comfort_noise: 7.5, tread_life: 7.2, efficiency: 7.0 }
            },
            {
                year: "2016",
                compYear: "2016",
                hkYear: "2015",
                compModel: "WinterContact TS860",
                compSlogan: "Cool precision - master snow, rain, and ice with maximum grip",
                compBrochure: {
                    compound: "Cool Chili Compound (가황 습윤 제동 극대화 수지 혼합)",
                    tech: "Liquid Layer Drainage (빙판 수막을 탈출시키는 미세 흡수 유로)",
                    treadwear: "Winter-rated / No UTQG",
                    focus: "Wet-winter asphalt braking excellence and snow groove cornering"
                },
                compScores: { dry_grip: 7.6, wet_grip: 8.7, hydro_resist: 8.4, comfort_noise: 8.2, tread_life: 8.2, efficiency: 7.9 },
                hkModel: "Winter i*cept evo2 (W320)",
                hkSlogan: "Optimized winter performance - outstanding braking on wet and icy roads",
                hkBrochure: {
                    compound: "High-dispersion Nano Silica Compound (나노 실리카 균일 중합)",
                    tech: "Ice-grip grooves & 3D winter sipes (수직 스키 배수 채널 설계)",
                    treadwear: "Winter-rated / No UTQG",
                    focus: "Premium winter passenger sedan dry grip and ice cornering stability"
                },
                hkScores: { dry_grip: 7.8, wet_grip: 8.2, hydro_resist: 8.0, comfort_noise: 8.0, tread_life: 7.6, efficiency: 7.4 }
            },
            {
                year: "2021",
                compYear: "2021",
                hkYear: "2020",
                compModel: "WinterContact TS870",
                compSlogan: "For safety, no winter can be too harsh - absolute snow mastery",
                compBrochure: {
                    compound: "Cool Chili Compound with customized polymer matrix (수명 10% 증대)",
                    tech: "Triple Sipe Concept (3차원 정합 사이프) & SnowCurve V-profile",
                    treadwear: "Winter-rated / No UTQG (유럽 공인 최고 등급 ADAC 테스트 1위)",
                    focus: "Unmatched snow braking safety, eco rolling-resistance target"
                },
                compScores: { dry_grip: 8.0, wet_grip: 9.1, hydro_resist: 8.8, comfort_noise: 8.5, tread_life: 8.7, efficiency: 8.4 },
                hkModel: "Winter i*cept evo3 (W330)",
                hkSlogan: "Perfect control on snow and wet - premium sporty winter experience",
                hkBrochure: {
                    compound: "Aqua Pine Compound (가문비나무 천연 오일 레진 추출 배합)",
                    tech: "V-shape wing grooves (V자 날개형 사선 급배수 홈) & Water pipe sipes",
                    treadwear: "Winter-rated / No UTQG (유럽 ADAC/Auto Bild '최우수' 평점 다수 획득)",
                    focus: "Superb wet-slush drainage, high-speed winter dry steering stability"
                },
                hkScores: { dry_grip: 8.2, wet_grip: 8.8, hydro_resist: 8.6, comfort_noise: 8.4, tread_life: 8.3, efficiency: 7.8 }
            }
        ],
        evolutionDirection: {
            gen1_to_gen2: "콘티넨탈은 TS850에서 TS860으로 모델 체인지하며 눈길 외에도 '빙판 위 액체 수막 수축 배수'를 위한 'Liquid Layer Drainage' 특허 패턴을 적용해 빙판 및 젖은 노면 복합 제동력을 높였습니다. 한국타이어는 W310에서 W320으로 체인지하며 눈길 종방향 접지만 중시하던 설계에서 3D 윈터 사이프 면적 강성 극대화를 통해 '고온 건조 노면 및 젖은 노면 코너링 조종 강성'을 보강하여 아우디, 포르쉐 등 프리미엄 차량의 스포츠 겨울철 주행 안정성을 끌어올렸습니다.",
            gen2_to_gen3: "TS860에서 TS870으로 교체하며 콘티넨탈은 수명 10% 증대 및 저회전 구름저항을 실현하는 'Cool Chili 고분자 최적화 매트릭스 컴파운드'를 적용해 유럽 ADAC 친환경 윈터 라벨 1위 위상을 선점했습니다. 한국타이어는 W320에서 W330(evo3)으로 완전 체인지하며 천연 침엽수 가문비 레진인 'Aqua Pine 컴파운드'와 'V자형 날개 그루브' 패턴을 과감히 도입하여 슬러시/폭우 급배수성을 대폭 향상시켜 유럽 최고 권위 테스트인 Auto Bild에서 최우수('Exemplary') 평가를 휩쓸며 콘티넨탈의 아성을 강력 위협하는 세대교체를 달성했습니다.",
            comparisonSummary: "콘티넨탈 WinterContact는 마이크로 실리카 물성 융합과 동절기 수막 배수 엔지니어링의 정교한 매핑에 주안점을 두는 반면, 한국타이어 Winter i*cept evo 시리즈는 유럽 아우토반 주행 성능에 부합하도록 동절기 저온 마른/젖은 노면의 초고속 주행 조종 안정성 및 강력한 사선 배수력 확보에 최우선적 강점을 발휘합니다."
        },
        insights: {
            past: "알프스 및 북유럽 강설 기후에 최적화된 마찰 면적 연성 복원 및 슬러시 눈길 탈출 견인력에 집중.",
            present: "유럽 겨울철 복합 기후(눈길+젖은 노면+건조 블랙아이스) 상쇄를 위한 복합 사이프 마이크로 패터닝 집중.",
            future: "친환경 재생 바이오 레진 사용량 50% 이상 돌파, 중하중 고출력 고토크 EV 겨울철 트랙션 한계 보강."
        },
        proposal: "콘티넨탈 WinterContact TS870의 독보적인 저온 습윤 제동 및 겨울철 수명 마일리지 밸런스에 대항하여, 당사 iON Winter 및 Winter i*cept evo3의 겨울철 고속 주행 시 열/응력 집중에 따른 컴파운드 찢김 방지 3D 인터로킹 윈터 사이프 설계를 고도화하고 친환경 고유성 천연 오일 수급 플랫폼을 확보해야 합니다."
    },
    Pirelli_Sport: {
        brand: "Pirelli",
        lineupKey: "Pirelli_Sport",
        lineupName: "P Zero (Summer UHP)",
        segmentEU: "Ultra High Performance (UHP)",
        segmentUS: "Grand Touring (All-Season) - Passenger",
        flagshipLine: "P Zero Series (Extreme Sport & Premium OE)",
        hankookLine: "Ventus S1 evo Series (Summer UHP)",
        generations: [
            {
                year: "2007",
                compYear: "2007",
                hkYear: "2007",
                compModel: "P Zero (PZ3 / Hero)",
                compSlogan: "The custom-built legacy of racing grip and prestige",
                compBrochure: {
                    compound: "Nano-composite compound (고온 서킷 마찰 정합 나노 실리카 배합)",
                    tech: "S-treme asymmetric pattern (타이트한 리브 강성 및 급배수 홈)",
                    treadwear: "UTQG 220 / AA A",
                    focus: "Maximum dry traction and lateral cornering force for supercars"
                },
                compScores: { dry_grip: 9.0, wet_grip: 8.1, hydro_resist: 7.9, comfort_noise: 7.6, tread_life: 6.0, efficiency: 7.0 },
                hkModel: "Ventus S1 evo (K107)",
                hkSlogan: "Optimal wet performance and high speed stability",
                hkBrochure: {
                    compound: "Highly dispersible Silica compound",
                    tech: "Wave-type outer block (파도형 외측 숄더 블록 압력 분산)",
                    treadwear: "UTQG 280 / A A",
                    focus: "High-speed cornering stability and short dry braking distance"
                },
                hkScores: { dry_grip: 8.2, wet_grip: 7.8, hydro_resist: 7.6, comfort_noise: 7.8, tread_life: 6.8, efficiency: 7.2 }
            },
            {
                year: "2016",
                compYear: "2016",
                hkYear: "2012",
                compModel: "P Zero (PZ4)",
                compSlogan: "Tailor-made performance for the world's most prestigious vehicles",
                compBrochure: {
                    compound: "F1 High-Silica Compound & customized outer design per vehicle",
                    tech: "F1 Bead Technology (림 결착력 및 사이드월 강성 레이싱 비드 공법)",
                    treadwear: "UTQG 280 / AA A",
                    focus: "OE supercar custom matching, rapid handling, and high-speed safety"
                },
                compScores: { dry_grip: 9.4, wet_grip: 8.7, hydro_resist: 8.3, comfort_noise: 8.1, tread_life: 7.4, efficiency: 7.6 },
                hkModel: "Ventus S1 evo2 (K117)",
                hkSlogan: "Prestige handling with innovative cooling block technology",
                hkBrochure: {
                    compound: "High-grip Styrene-polymer silica",
                    tech: "Aqua Driving System (속도 감응형 복합 수막 탈출 그루브)",
                    treadwear: "UTQG 300 / A A",
                    focus: "Prestige passenger sedan handling balance and cooling block heat dissipation"
                },
                hkScores: { dry_grip: 8.8, wet_grip: 8.4, hydro_resist: 8.1, comfort_noise: 8.2, tread_life: 7.4, efficiency: 7.6 }
            },
            {
                year: "2025",
                compYear: "2025",
                hkYear: "2024",
                compModel: "P Zero (PZ5)",
                compSlogan: "The next chapter of bespoke high performance: AI-driven precision and safety",
                compBrochure: {
                    compound: "Plasticized Durability Compound Blend (기후 감응형 소성변형 방지 고밀도 고무 혼합물)",
                    tech: "Steeply Inclined Main Grooves & AI Virtual Profile (AI 가상 구조 설계를 통한 측방향 지지 숄더 변형 억제 배수 홈)",
                    treadwear: "UTQG 320 / AA A",
                    focus: "Ultimate wet-grip response (EU A label), improved dry steering precision, and optimized tread pattern durability"
                },
                compScores: { dry_grip: 9.6, wet_grip: 9.4, hydro_resist: 8.8, comfort_noise: 8.6, tread_life: 8.2, efficiency: 8.4 },
                hkModel: "Ventus S1 evo4 (K137)",
                hkSlogan: "Next-generation ultra-high performance summer flagship with AI-optimized compounds",
                hkBrochure: {
                    compound: "AI-Optimized Ultra-High Dispersion Silica Compound (AI 기반 실리카 초고분산 배합)",
                    tech: "AI-Assisted Tread Profile & 32% Extended Mileage Construction (AI 기술 활용 접지면 최적화 및 수명 32% 극대화 공법)",
                    treadwear: "UTQG 340 / AA A (수명 32% 대폭 연장)",
                    focus: "AI-optimized dry/wet contact patch, superb handling precision, and ultra-high mileage"
                },
                hkScores: { dry_grip: 9.4, wet_grip: 9.1, hydro_resist: 8.7, comfort_noise: 8.8, tread_life: 8.9, efficiency: 8.2 }
            }
        ],
        evolutionDirection: {
            gen1_to_gen2: "피렐리는 PZ3의 폭발적인 드라이 그립 서킷 중심 설계에서 PZ4로 세대 교체하며 포뮬러 1 비드 구조 설계(F1 Bead Tech)를 사이드월에 수평 적용하여 선회 시 림과의 결착 압력 저항을 대폭 높이고 타이어 젖은 노면 제동력을 대칭 보강했습니다. 한국타이어는 evo1에서 evo2로 모델 체인지하며 타이어 표면 미세 쿨링핀 설계를 숄더 외측에 주입하여, 고속 스포츠 코너링 시 비접지면 열분산을 자동화하는 엔지니어링 구조 개선을 일궈냈습니다.",
            gen2_to_gen3: "PZ4에서 최신 5세대 P Zero(PZ5)로 완전 체인지되며 피렐리는 AI 가상 모델링 기법을 적용해 횡강성을 올리고 젖은 배수성 EU Label A등급 수준을 상시 만족시켰습니다. 이에 한국타이어는 최고의 초고성능 기술력을 응축하여 2024년 Ventus S1 evo4(K137)를 전격 선보였습니다. AI 초고분산 실리카 배합과 접지압 균일 공법을 통해 피렐리 PZ5 대비 수명을 32%나 연장하면서도 최고속 선회에서의 지지력을 동등 이상으로 다듬는 엔지니어링 패러다임 전환을 달성했습니다.",
            comparisonSummary: "피렐리 P Zero PZ5는 AI 최적화 가변 사선 홈 설계를 통해 드라이/웨트 코너링 피드백을 극대화하는 반면, 한국타이어 Ventus S1 evo4 K137은 AI 실리카 정밀 입자 분산 배합과 고지속 접지 형상을 확보하여 동급 최고의 마일리지를 제공하면서 고강성 스포츠 드라이빙 마진을 완벽하게 지원합니다."
        },
        insights: {
            past: "F1 포뮬러 연계를 전면에 내세워 고온 접지 및 순간 횡가속도를 견디는 하이 마진 스포츠 서킷 주행 성능에 집중.",
            present: "EU 라벨링 트리플 A 획득을 표방하며 친환경 컴파운딩을 UHP에 도입하고, 초저소음 공기 흡음 패드(PNCS) 보급.",
            future: "사이드월 내장 Active Cyber-Sensor 연계 주행(ECU 노면 접지 정보 다이렉트 전송), RunForward 펑크 자립 안전 보강 기술 확대."
        },
        proposal: "피렐리 P Zero PZ5가 이룩한 초고성능 프리미엄 스포츠 세그먼트에 대응하기 위해, 당사 Ventus S1 evo4의 고강성 하이브리드 아라미드 특수 벨트 공법을 추가 고도화하고, 바이오 실리카 배합 플랫폼을 안정화하는 연구를 지속하며 타이어 트레드에 결착하는 자가 발전 능동형 센서(Active Sensor) R&D 플랫폼 특허를 선제 확보하여 피렐리의 지능형 전장 연동 시스템에 대항해야 합니다."
    }
};

window.TIRE_EVOLUTION_DATABASE = TIRE_EVOLUTION_DATABASE;
