import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { IDatabaseOperations } from "../contracts/interfaces/databaseOperations.interface";
import { EnumGitPullEventStatus } from "../contracts/enums/gitPullEventStatus";
import { IGitPullEvent } from "../contracts/interfaces/gitPullEvent.interface";
import { AmplicationError } from "../errors/AmplicationError";

@Injectable()
export class GitPullEventRepository implements IDatabaseOperations {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventData: any): Promise<any> {
    return this.prisma.gitPullEvent.create({
      data: eventData,
      select: {
        id: true,
        provider: true,
        repositoryOwner: true,
        repositoryName: true,
        branch: true,
        commit: true,
        status: true,
        pushedAt: true,
      },
    });
  }

  async update(id: number, status: EnumGitPullEventStatus): Promise<any> {
    return this.prisma.gitPullEvent.update({
      where: { id: id },
      data: { status: status },
      select: {
        id: true,
        provider: true,
        repositoryOwner: true,
        repositoryName: true,
        branch: true,
        commit: true,
        status: true,
        pushedAt: true,
      },
    });
  }

  async getPrevXReadyCommit(
    eventData: IGitPullEvent,
    skip: number,
    timestamp: Date
  ): Promise<any> {
    try {
      const { provider, repositoryOwner, repositoryName, branch } = eventData;
      const prevXReadyCommit = await this.prisma.gitPullEvent.findMany({
        where: {
          provider: provider,
          repositoryOwner: repositoryOwner,
          repositoryName: repositoryName,
          branch: branch,
          status: EnumGitPullEventStatus.Ready,
          pushedAt: {
            lt: timestamp,
          },
        },
        orderBy: {
          pushedAt: "desc",
        },
        skip: skip,
        take: 1,
        select: {
          id: true,
          provider: true,
          repositoryOwner: true,
          repositoryName: true,
          branch: true,
          commit: true,
        },
      });

      // skip = 1 we want only the last ready commit, but we didn't find one
      if (!prevXReadyCommit && skip === 1) {
        // no prev ready commit, need to clone
        return null;
      }

      return prevXReadyCommit;
    } catch (err) {
      throw new AmplicationError(
        `Error from GitPullEventRepository => getLastReadyCommit: ${err}`
      );
    }
  }
}