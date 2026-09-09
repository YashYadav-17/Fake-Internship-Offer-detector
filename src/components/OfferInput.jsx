import React from 'react';

export default function OfferInput({ offerText, setOfferText, onAnalyze, loading }) {
  const maxLength = 10000;
  const isInputEmpty = !offerText || offerText.trim().length === 0;

  const handleTextChange = (e) => {
    if (e.target.value.length <= maxLength) {
      setOfferText(e.target.value);
    }
  };

  return (
    <div className="offer-input-container">
      <div className="input-header">
        <h2 className="input-heading">Check an offer</h2>
        <p className="input-subtext">Paste the internship or job message you received.</p>
      </div>

      <div className="textarea-wrapper">
        <textarea
          className="offer-textarea"
          rows={7}
          placeholder="Congratulations! You have been selected for our internship. To confirm your position, please pay a ₹20,000 security deposit today. Limited seats available. Act immediately."
          value={offerText}
          onChange={handleTextChange}
          disabled={loading}
        />
        <div className="character-counter">
          {offerText.length.toLocaleString()} / {maxLength.toLocaleString()} characters
        </div>
      </div>

      <button
        type="button"
        className="analyze-button"
        disabled={isInputEmpty || loading}
        onClick={onAnalyze}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Analyze Offer</span>
            <span className="button-arrow">→</span>
          </>
        )}
      </button>
    </div>
  );
}
