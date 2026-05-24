import UserPhoto from "../models/UserPhoto.js";

class UserPhotoRepository {
  async create(photoData, transaction) {
    return await UserPhoto.create(photoData, { transaction });
  }

  async findById(id) {
    return await UserPhoto.findByPk(id);
  }

  async findByUserId(userId) {
    return await UserPhoto.findAll({
      where: { user_id: userId },
      order: [["display_order", "ASC"]],
    });
  }

  async findPrimary(userId) {
    return await UserPhoto.findOne({
      where: { user_id: userId, is_primary: true },
    });
  }

  async update(id, updateData) {
    const photo = await UserPhoto.findByPk(id);
    if (!photo) return null;
    return await photo.update(updateData);
  }

  async delete(id) {
    return await UserPhoto.destroy({ where: { photo_id: id } });
  }

  async deleteByUserId(userId) {
    return await UserPhoto.destroy({ where: { user_id: userId } });
  }
}

export default new UserPhotoRepository();
