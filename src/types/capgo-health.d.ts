declare module "@capgo/capacitor-health" {
  export interface HealthAvailability {
    available: boolean;
    reason?: string;
  }

  export interface AuthorizationStatus {
    granted: boolean;
  }

  export interface AggregatedSample {
    value: number;
    startDate: string;
    endDate: string;
  }

  export interface QueryAggregatedResult {
    samples: AggregatedSample[];
  }

  export const Health: {
    isAvailable(): Promise<HealthAvailability>;
    requestAuthorization(options: {
      read: string[];
      write: string[];
    }): Promise<AuthorizationStatus>;
    queryAggregated(options: {
      dataType: string;
      startDate: string;
      endDate: string;
      bucket: string;
    }): Promise<QueryAggregatedResult>;
  };
}
