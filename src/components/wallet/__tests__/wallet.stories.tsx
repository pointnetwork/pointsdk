import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Wallet } from "../component";
import { Story } from "@src/components/dev";

storiesOf("Wallet", module).add("renders", () => {
    return (
        <Story>
            <Wallet />
        </Story>
    );
});
