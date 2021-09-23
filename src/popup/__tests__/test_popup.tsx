import * as React from "react";
import { Popup } from "../component";
import renderer from "react-test-renderer";

test.skip("component renders", () => {
    const tree = renderer.create(<Popup />).toJSON();
    expect(tree).toMatchSnapshot();
});
