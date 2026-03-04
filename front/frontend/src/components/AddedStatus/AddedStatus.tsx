import "./AddedStatus.scss";

type AddedStatusProps = {
  text: string;
  tone: "success" | "error";
};

export const AddedStatus = ({ text, tone }: AddedStatusProps) => (
  <div
    className={`added-status added-status--${tone}`}
    role="status"
    aria-live="polite"
  >
    <span className="added-status__text">{text}</span>
  </div>
);

