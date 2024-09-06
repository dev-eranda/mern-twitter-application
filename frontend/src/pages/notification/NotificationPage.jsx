import { Link } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatPostDate } from "../../utils/date";

import LoadingSpinner from "../../components/common/LoadingSpinner";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(error.data || "Somthing went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="p-4 font-bold text-center">No notifications</div>
        )}

        {notifications?.map((notification) => (
          <div className="p-4 border-b border-gray-700" key={notification._id}>
            <Link to={`/profile/${notification.from.username}`}>
              <div className="flex items-center w-full gap-4 mb-2 ">
                {/* <div className="avatar">
                  <div className="rounded-full size-10">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                      className="abosolute"
                    />
                  </div>
                  {notification.type === "follow" && (
                    <FaUser className="relative w-4 h-4 text-primary" />
                  )}
                  {notification.type === "like" && (
                    <FaHeart className="relative w-4 h-4 ml-[-10] text-red-500" />
                  )}
                </div> */}
                <div className="relative inline-block avatar">
                  <div className="w-10 h-10 overflow-hidden rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                      className="object-cover w-full h-full"
                      alt="Profile"
                    />
                  </div>
                  {notification.type === "follow" && (
                    <FaUser className="absolute bottom-0 right-0 w-6 h-6 p-1 text-white bg-blue-500 border border-gray-300 rounded-full" />
                  )}
                  {notification.type === "like" && (
                    <FaHeart className="absolute bottom-0 right-0 w-6 h-6 p-1 text-white bg-red-500 border border-gray-300 rounded-full" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      @{notification.from.username}
                    </span>
                    {notification.type === "follow"
                      ? "followed you"
                      : "liked your post"}
                  </div>
                  <div className="items-center">
                    <span className="text-sm font-bold text-blue-400">
                      {formatPostDate(notification?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
