import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Navigation } from "../component";
import { Story } from "@src/components/dev";

storiesOf("Navigation", module).add("renders", () => {
    return (
        <Story>
            <Navigation />
        </Story>
    );
});
