import User from "./User.js";
import UserPhoto from "./UserPhoto.js";
import UserPreference from "./UserPreference.js";
import Interaction from "./Interaction.js";
import Match from "./Match.js";
import Message from "./Message.js";

// Define relationships
User.hasMany(UserPhoto, { foreignKey: "user_id", as: "photos" });
UserPhoto.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(UserPreference, { foreignKey: "user_id", as: "preferences" });
UserPreference.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Interaction, { foreignKey: "actor_id", as: "actions" });
User.hasMany(Interaction, {
  foreignKey: "target_id",
  as: "receivedInteractions",
});
Interaction.belongsTo(User, { foreignKey: "actor_id", as: "actor" });
Interaction.belongsTo(User, { foreignKey: "target_id", as: "target" });

User.hasMany(Match, { foreignKey: "user1_id", as: "matchesAsUser1" });
User.hasMany(Match, { foreignKey: "user2_id", as: "matchesAsUser2" });
Match.belongsTo(User, { foreignKey: "user1_id", as: "user1" });
Match.belongsTo(User, { foreignKey: "user2_id", as: "user2" });

Match.hasMany(Message, { foreignKey: "match_id", as: "messages" });
Message.belongsTo(Match, { foreignKey: "match_id" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

export { User, UserPhoto, UserPreference, Interaction, Match, Message };
