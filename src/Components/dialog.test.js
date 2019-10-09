import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { Dialog } from "./dialog";

const renderDialog = props => render(<Dialog {...props} />);

describe("Dialog", () => {
  it("should render the title and action text it is given; and perform onClick action", () => {
    const onClickSpy = jest.fn();
    const { getByText } = renderDialog({
      body: "test body",
      action: "test action",
      onClick: onClickSpy
    });

    expect(getByText("test body")).toBeDefined();
    expect(getByText("test action")).toBeDefined();

    fireEvent.click(getByText("test action"));
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });
});
