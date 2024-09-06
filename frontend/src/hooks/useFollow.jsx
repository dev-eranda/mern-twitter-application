import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: follow,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/follow/${userId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },

    onSuccess: (following) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.setQueryData(["authUser"], (oldData) => {
          return {
            ...oldData,
            following,
          };
        }),
      ]);
    },

    onError: () => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};

export default useFollow;
