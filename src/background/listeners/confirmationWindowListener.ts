import { closeConfirmationWindow } from "../confirmationWindowApi";

const confirmationWindowListener = async (message: any) => {
    console.log(message);
    await closeConfirmationWindow();
};

export default confirmationWindowListener;
