declare module "@capgo/capacitor-health" {
  export type HealthDataType = "steps" | "distance";

  export interface HealthAvailability {
    available: boolean;
    platform?: "ios" | "android" | "web";
    reason?: string;
  }

  export interface AuthorizationStatus {
    readAuthorized: HealthDataType[];
    readDenied: HealthDataType[];
    writeAuthorized: HealthDataType[];
    writeDenied: HealthDataType[];
  }

  export interface AggregatedSample {
    value: number;
    startDate: string;
    endDate: string;
  }

  export interface QueryAggregatedResult {
    samples: AggregatedSample[];
  }

  export interface HealthPlugin {
    isAvailable(): Promise<HealthAvailability>;
    checkAuthorization(options: {
      read?: HealthDataType[];
      write?: HealthDataType[];
    }): Promise<AuthorizationStatus>;
    requestAuthorization(options: {
      read?: HealthDataType[];
      write?: HealthDataType[];
    }): Promise<AuthorizationStatus>;
    queryAggregated(options: {
      dataType: HealthDataType;
      startDate: string;
      endDate: string;
      bucket: string;
    }): Promise<QueryAggregatedResult>;
  }

  export const Health: HealthPlugin;
}
