import { ManageViewActions } from "@src/types/manageView";
// import { Types } from "@src/types/shared";

export const ManageViewReducer = (state: string, action: ManageViewActions) => {
    switch (action.type) {
        case "UPDATE_VIEW":
            return (state = action.payload);
        default:
            return state;
    }
};
