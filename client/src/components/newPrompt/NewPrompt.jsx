import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });
  const { getToken } = useAuth();

  const chat = model.startChat({
    history:
      data?.history?.map(({ role, parts }) => ({
        role,
        parts: [{ text: parts?.[0]?.text || "" }],
      })) || [],
    generationConfig: {
      // maxOutputTokens: 100,
    },
  });

  const endRef = useRef(null);
  const formRef = useRef(null);
  const uploadRef = useRef(null);
  const location = useLocation();

  // Auto-scroll effect for real-time updates
  useEffect(() => {
    // Add a small delay to ensure DOM has updated
    const scrollToEnd = () => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Use setTimeout to ensure scroll happens after DOM update
    const timeoutId = setTimeout(scrollToEnd, 100);

    return () => clearTimeout(timeoutId);
  }, [data, question, answer, img.dbData]);

  // Initial scroll when component mounts with existing chat data
  useEffect(() => {
    if (data?.history?.length > 0) {
      const scrollToEnd = () => {
        if (endRef.current) {
          endRef.current.scrollIntoView({ behavior: "smooth" });
        }
      };

      // Longer delay for initial load to ensure all content is rendered
      const timeoutId = setTimeout(scrollToEnd, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [data?._id]); // Only run when chat ID changes (new chat loaded)

  // Auto-trigger file selector for image analysis
  useEffect(() => {
    if (location.state?.triggerFileSelector && data?.history?.length === 1) {
      // Small delay to ensure chat is fully loaded
      const timer = setTimeout(() => {
        // Trigger the file selector automatically
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.click();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.state, data]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (finalAnswer) => {
      const token = await getToken();

      const payload = {
        question: question.length ? question : undefined,
        answer: finalAnswer,
        img: img.dbData?.filePath || undefined,
      };

      console.log("=== MUTATION DEBUG ===");
      console.log("Chat ID:", data._id);
      console.log("Question:", question);
      console.log("Answer:", answer);
      console.log("Answer length:", answer?.length);
      console.log("Payload being sent:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${data._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Mutation response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate(accumulatedText);
    } catch (err) {
      console.log("AI Generation Error:", err);

      // Handle quota exceeded error with mock response
      if (err.message?.includes("429") || err.message?.includes("quota")) {
        console.log("Quota exceeded, using mock response for testing");
        const mockResponse = `I apologize, but the AI quota has been exceeded for today. This is a mock response to test the chat functionality. Your question was: "${text}". \n\nTo get real AI responses, please either:\n1. Wait until midnight Pacific time for quota reset\n2. Upgrade to a paid tier\n3. Use a different API key`;

        setAnswer(mockResponse);
        mutation.mutate(mockResponse);
      } else {
        // Handle other errors
        const errorMsg =
          "Sorry, there was an error generating a response. Please try again later.";
        setAnswer(errorMsg);
        mutation.mutate(errorMsg);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const text = e.target.text.value;
    if (!text) return;

    add(text, false);
  };

  // IN PRODUCTION WE DON'T NEED IT
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts?.[0]?.text || "", true);
      }
    }
    hasRun.current = true;
  }, []);

  return (
    <>
      {/* ADD NEW CHAT */}
      {img.isLoading && <div className="">Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: "10px",
            display: "block",
            marginBottom: "10px",
            backgroundColor: "#1a1a1a",
            maxHeight: "400px",
          }}
          transformation={[
            {
              quality: 80,
              format: "webp",
              crop: "pad_resize",
              background: "auto",
            },
          ]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input
          type="text"
          name="text"
          placeholder="Ask anything..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
        />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
