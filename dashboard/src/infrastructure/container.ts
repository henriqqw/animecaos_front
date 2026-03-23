import { GetFunnelMetricsUseCase } from "@/application/use-cases/GetFunnelMetricsUseCase";
import { GetDownloadAttributionMetricsUseCase } from "@/application/use-cases/GetDownloadAttributionMetricsUseCase";
import { GetExplorerMetricsUseCase } from "@/application/use-cases/GetExplorerMetricsUseCase";
import { GetOverviewMetricsUseCase } from "@/application/use-cases/GetOverviewMetricsUseCase";
import { GetTimeseriesUseCase } from "@/application/use-cases/GetTimeseriesUseCase";
import { GetTopPagesUseCase } from "@/application/use-cases/GetTopPagesUseCase";
import { TrackEventUseCase } from "@/application/use-cases/TrackEventUseCase";
import { FileEventRepository } from "@/infrastructure/repositories/FileEventRepository";

const repository = new FileEventRepository();

export const container = {
  trackEventUseCase: new TrackEventUseCase(repository),
  getOverviewMetricsUseCase: new GetOverviewMetricsUseCase(repository),
  getTimeseriesUseCase: new GetTimeseriesUseCase(repository),
  getFunnelMetricsUseCase: new GetFunnelMetricsUseCase(repository),
  getDownloadAttributionMetricsUseCase: new GetDownloadAttributionMetricsUseCase(repository),
  getTopPagesUseCase: new GetTopPagesUseCase(repository),
  getExplorerMetricsUseCase: new GetExplorerMetricsUseCase(repository)
};
