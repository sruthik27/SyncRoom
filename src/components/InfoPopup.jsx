import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const InfoPopup = ({ onClose }) => {
  const overlayRef = useRef(null);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleOverlayClick = (e) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    setIsSubmitting(true);
    setMessage(""); // Reset message

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      setIsSubmitting(false);
      return;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Invalid email format");
      setIsSubmitting(false);
      return;
    } else {
      setEmailError("");
    }

    const payload = {
      email: email.trim(),
      message: feedback.trim(),
    };

    try {
      const response = await fetch(
        "https://owdylz7uw1.execute-api.ap-south-1.amazonaws.com/v1/sendfeedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setMessage("Feedback submitted successfully!");
        setEmail("");
        setFeedback("");
      } else {
        const error = await response.json();
        setMessage(
          `Failed to submit feedback: ${error.error || "Unknown error"}`,
        );
      }
    } catch (err) {
      setMessage(`Failed to submit feedback: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[500]"
      onClick={handleOverlayClick}
      data-testid="info-popup-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="w-full max-w-lg"
        data-testid="info-popup"
      >
        <Card className="bg-secondary text-light-purple">
          <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold" data-testid="popup-title">
                About This App
              </h2>
              <button onClick={onClose} data-testid="close-button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p data-testid="app-description">
                SyncRoom lets you and your friends share the music experience by
                joining a virtual room where everyone can add songs and listen
                together in perfect sync. It ensures everyone is on the same
                beat—pause, play, change tracks, or seek to specific times, all
                in real-time for everyone. Simply share your room code to invite
                and start enjoying music together!
              </p>
              <p>
                <strong>Limitations:</strong>
                <ul
                  className="list-disc list-inside"
                  data-testid="limitations-list"
                >
                  <li>A maximum of 10 members can join a room.</li>
                  <li>Each room can hold up to 20 songs.</li>
                  <li>Rooms remain active for up to 1 hour.</li>
                  <li>Uploaded songs must be less than 10MB each.</li>
                  <li>
                    YouTube songs requires to stay active on tab for syncing.
                  </li>
                  <li>
                    Audio only songs can continue playing in the background
                  </li>
                  <li>
                    For personal unsynced control use keyboard music controls
                  </li>
                </ul>
              </p>
              <h3
                className="text-lg font-semibold"
                data-testid="feedback-title"
              >
                Feedback
              </h3>
              <form
                className="space-y-4"
                onSubmit={handleSubmit}
                data-testid="feedback-form"
              >
                <Input
                  placeholder="Your email (required)"
                  className="bg-secondary border-2 border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                />
                {emailError && (
                  <p className="text-red-500 text-sm" data-testid="email-error">
                    {emailError}
                  </p>
                )}
                <Textarea
                  placeholder="Your feedback"
                  rows="4"
                  className="bg-secondary border-2 border-primary"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  data-testid="feedback-input"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-button"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
              {message && (
                <p
                  className={`mt-4 text-sm ${
                    message.includes("successfully")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                  data-testid="submission-message"
                >
                  {message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InfoPopup;
