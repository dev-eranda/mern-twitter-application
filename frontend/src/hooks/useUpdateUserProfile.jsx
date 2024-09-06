import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useUpdateUserProfle = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isProfileUpdating } =
    useMutation({
      mutationFn: async (formdata) => {
        try {
          const res = await fetch("/api/users/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formdata),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Something went wrong");
          }

          return data;
        } catch (error) {
          throw new Error(error);
        }
      },

      onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        ]);
        toast.success("Profile update successfullt");
      },

      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isProfileUpdating };
};

export default useUpdateUserProfle;
