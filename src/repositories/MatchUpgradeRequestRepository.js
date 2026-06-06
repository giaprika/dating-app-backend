import { MatchUpgradeRequest } from "../models/index.js";

class MatchUpgradeRequestRepository {
  async create(data) {
    return await MatchUpgradeRequest.create(data);
  }

  async findPendingRequest(matchId) {
    return await MatchUpgradeRequest.findOne({
      where: {
        match_id: matchId,
        status: "pending",
      },
    });
  }

  async updateStatus(requestId, status) {
    const request = await MatchUpgradeRequest.findByPk(requestId);
    if (!request) return null;
    return await request.update({ status });
  }
}

export default new MatchUpgradeRequestRepository();
