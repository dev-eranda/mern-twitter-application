import Notification from "../models/notofication.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    // Update notifications to read status after fetching
    await Notification.updateMany({ to: userId, read: false }, { read: true });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ to: userId });

    return res.status(200).json({
      message: `Notifications deleted successfully (${result.deletedCount})`,
    });
  } catch (error) {
    console.error("Error in deleteNotifications controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
