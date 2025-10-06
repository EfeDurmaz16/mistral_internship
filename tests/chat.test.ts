import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatBox from "@/components/ChatBox";

describe("ChatBox", () => {
  it("shows the onboarding helper text", () => {
    render(<ChatBox />);
    expect(
      screen.getByText(/Say hello and watch the last three exchanges stay around/i)
    ).toBeInTheDocument();
  });

  it("sends a message and displays the assistant reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Hello back!" })
    });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<ChatBox />);

    const input = screen.getByPlaceholderText(/Ask Mistral anything/i);
    await user.type(input, "Hi there");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Hello back!")).toBeInTheDocument();
    });
  });
});
