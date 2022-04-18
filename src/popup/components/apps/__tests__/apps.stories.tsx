import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Apps } from "../component";
import { Story } from "pointsdk/popup/components/dev";

storiesOf("Apps", module).add("renders", () => {
    return (
        <Story>
            <Apps />
        </Story>
    );
});
