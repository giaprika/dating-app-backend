import User from "../models/User.js";

class UserRepository {
  async create(userData) {
    return await User.create({
      email: userData.email,
      password_hash: userData.password_hash,
      full_name: userData.full_name,
      bith_date: userData.bith_date,
      gender: userData.gender,
      bio: userData.bio,
    });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByEmailWithoutPassword(email) {
    return await User.findOne({ where: { email } });
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(updateData);
  }

  async delete(id) {
    return await User.destroy({ where: { user_id: id } });
  }

  async findAll(query = {}, limit = 10, offset = 0) {
    return await User.findAll({
      where: query,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async countTotal(query = {}) {
    return await User.count({ where: query });
  }

  async emailExists(email) {
    return await User.findOne({ where: { email } });
  }
}

export default new UserRepository();
