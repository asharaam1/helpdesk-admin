export const sendEmail = async (to, subject, text) => {
  try {
    const response = await fetch("http://localhost:3000/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send email");
    }

    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
