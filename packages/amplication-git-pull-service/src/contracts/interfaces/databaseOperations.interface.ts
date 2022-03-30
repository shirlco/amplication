import { EnumGitPullEventStatus } from "../enums/gitPullEventStatus";
import { IGitPullEvent } from "./gitPullEvent.interface";

export interface IDatabaseOperations {
  create: (eventData: any) => Promise<any>;
  update: (id: number, status: EnumGitPullEventStatus) => Promise<any>;
  getPrevXReadyCommit: (
    eventData: IGitPullEvent,
    skip: number,
    timestamp: Date
  ) => Promise<any>;
}