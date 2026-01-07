import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom"; // Import useParams

const NewPrompt = ({ data }) => {
  const { id } = useParams(); // Get the Chat ID directly from the URL
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const chat = model.startChat({
    history:
      data?.history?.map(({ role, parts }) => ({
        role,
        parts: [{ text: parts[0].text }],
      })) || [],
    generationConfig: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, answer, question, img.dbData]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ question, answer, img }) => {
      // Use the 'id' from useParams
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          img,
        }),
      }).then((res) => res.json());
    },
    onSuccess: async () => {
      // Wait for the re-fetch to complete before clearing the screen
      await queryClient.invalidateQueries({ queryKey: ["chat", id] });

      formRef.current.reset();
      setQuestion("");
      setAnswer("");
      setLoading(false);
      setImg({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
      });
    },
    onError: (err) => {
      console.log(err);
      setLoading(false);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);
    setLoading(true);

    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      // Pass the final text directly to the mutation
      mutation.mutate({
        question: text,
        answer: accumulatedText,
        img: img.dbData?.filePath || undefined,
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text || loading) return;
    add(text, false);
  };

  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;
  }, []);

  return (
    <>
      {img.isLoading && <div>Loading...</div>}

      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}

      {/* SHOW QUESTION WHILE LOADING */}
      {question && (
        <div className="message user">
          <div className="content">
            <Markdown>{question}</Markdown>
          </div>
        </div>
      )}

      {/* SHOW ANSWER WHILE LOADING */}
      {answer && (
        <div className="message">
          <div className="content">
            <Markdown>{answer}</Markdown>
          </div>
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
        />
        <button disabled={loading || img.isLoading}>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
