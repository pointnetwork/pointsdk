import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Toolbar } from "../component";
import { Story } from "pointsdk/popup/components/dev";

storiesOf("Toolbar", module).add("renders", () => {
    return (
        <Story>
            <Toolbar />
        </Story>
    );
});
