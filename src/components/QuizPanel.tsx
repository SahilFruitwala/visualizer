import { useState } from "react";
import type { QuizQuestion } from "../engine/types";
import { markTopicComplete } from "../engine/progress";

export function QuizPanel({
  topicId,
  questions,
}: {
  topicId: string;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  if (questions.length === 0) return null;

  const allAnswered = questions.every((_, i) => answers[i] != null);
  const allCorrect =
    allAnswered &&
    questions.every((q, i) => answers[i] === q.correctIndex);

  return (
    <section className="panel quiz-panel">
      <div className="panel-title">Check your understanding</div>
      {questions.map((q, qi) => {
        const picked = answers[qi];
        const show = revealed[qi];
        const correct = picked === q.correctIndex;
        return (
          <div key={qi} className="quiz-q">
            <p className="quiz-question">{q.question}</p>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let state = "";
                if (show) {
                  if (oi === q.correctIndex) state = "correct";
                  else if (oi === picked) state = "wrong";
                } else if (picked === oi) state = "picked";
                return (
                  <button
                    key={oi}
                    type="button"
                    className="quiz-opt"
                    data-state={state || undefined}
                    disabled={show}
                    onClick={() => {
                      const next = { ...answers, [qi]: oi };
                      setAnswers(next);
                      setRevealed((r) => ({ ...r, [qi]: true }));
                      const complete = questions.every(
                        (qq, j) => next[j] === qq.correctIndex,
                      );
                      if (complete) markTopicComplete(topicId);
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {show && (
              <p className={`quiz-feedback${correct ? " ok" : " bad"}`}>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
      {allAnswered && (
        <p className={`quiz-summary${allCorrect ? " ok" : ""}`}>
          {allCorrect
            ? "Nice — you nailed every question. Topic marked complete."
            : "Review the animation and try again."}
        </p>
      )}
    </section>
  );
}
