import React from 'react';

const QuestionCard = ({ question, value, onChange, onSubmit, onSkip, saving }) => {
  const renderResponseField = () => {
    switch (question.responseType) {
      case 'scale':
        return (
          <div className="question-card__scale">
            {[1, 2, 3, 4, 5].map((option) => (
              <button
                key={option}
                type="button"
                className={value === option ? 'active' : ''}
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'single_select':
        return (
          <div className="question-card__options">
            {question.responseOptions?.map((option) => (
              <button
                key={option}
                type="button"
                className={value === option ? 'active' : ''}
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'multi_select': {
        const selections = Array.isArray(value) ? value : [];
        const customEntry = selections.find((item) => typeof item === 'string' && item.startsWith('Custom: ')) || '';
        const customValue = customEntry.replace(/^Custom:\s*/i, '');
        const hasCustomEntry = selections.some((item) => typeof item === 'string' && item.startsWith('Custom: '));
        const isMedicalConditions = question.slug === 'medical-conditions';

        const toggleOption = (option) => {
          const baseSelections = selections.filter((item) => !(isMedicalConditions && String(item).startsWith('Custom: ')));
          if (option === 'None') {
            onChange(['None']);
            return;
          }

          let next = [...baseSelections.filter((item) => item !== 'None')];
          const currentlySelected = next.includes(option);

          if (isMedicalConditions && option === 'Other') {
            if (hasCustomEntry) {
              onChange(next);
            } else {
              onChange([...next, 'Custom: ']);
            }
            return;
          }

          if (currentlySelected) {
            next = next.filter((item) => item !== option);
          } else {
            next.push(option);
          }

          const withCustom = customValue ? [...next, `Custom: ${customValue}`] : next;
          onChange(withCustom);
        };

        const handleCustomChange = (event) => {
          const text = event.target.value.trim();
          const baseSelections = selections.filter((item) => !String(item).startsWith('Custom: '));
          if (!text) {
            onChange(baseSelections);
            return;
          }
          onChange([...baseSelections.filter((item) => item !== 'None'), `Custom: ${text}`]);
        };

        return (
          <>
            <div className="question-card__options">
              {question.responseOptions?.map((option) => {
                const isCustomToggle = isMedicalConditions && option === 'Other';
                const selected = isCustomToggle ? hasCustomEntry : selections.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={selected ? 'active' : ''}
                    onClick={() => toggleOption(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {isMedicalConditions && (
              <div className="question-card__custom">
                <label>
                  Add another condition
                  <input
                    type="text"
                    placeholder="e.g. Asthma"
                    value={customValue}
                    onChange={handleCustomChange}
                  />
                </label>
              </div>
            )}
          </>
        );
      }
      default: {
        if (question.slug === 'pregnancy-weeks' || question.slug === 'mama-age') {
          return (
            <input
              type="number"
              min={0}
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
            />
          );
        }

        if (question.slug === 'next-appointment') {
          return (
            <input
              type="date"
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
            />
          );
        }

        const rows = question.slug === 'emergency-contact' ? 3 : 4;

        return (
          <textarea
            rows={rows}
            placeholder="Share what feels right"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        );
      }
    }
  };

  return (
    <article className="question-card">
      <div className="question-card__meta">
        <span>{question.section}</span>
        <span>
          {question.isRequired ? 'Required' : 'Optional'}
        </span>
      </div>
      <h2>{question.prompt}</h2>
      {question.helpText && <p className="question-card__help">{question.helpText}</p>}
      {renderResponseField()}
      <div className="question-card__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onSubmit}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save & continue'}
        </button>
        {!question.isRequired && question.allowAnswerLater && (
          <button type="button" className="button button--ghost" onClick={onSkip} disabled={saving}>
            Answer later
          </button>
        )}
      </div>
    </article>
  );
};

export default QuestionCard;
