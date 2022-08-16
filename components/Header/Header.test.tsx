import { render } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it("should render", () => {
    const { getByText, getByAltText } = render(<Header />);

    getByAltText(/logo/i);
    getByText(/about/i);
    getByText(/contact/i);
    getByText(/follow/i);
    getByText(/sign in/i);
    getByText(/get started/i);
  });
});
