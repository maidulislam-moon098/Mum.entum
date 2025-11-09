import React, { useState } from 'react';

// Map of question slugs to tailored prompts with greetings
const tailoredPrompts = {
  'mama-name': {
    greeting: 'Nice to meet you!',
    question: 'What would you like Mum.entum to call you?'
  },
  'mama-age': {
    greeting: null,
    question: 'What year were you born?'
  },
  'mama-region': {
    greeting: null,
    question: 'Which country are you from?'
  },
  'substance-use-smoke': {
    greeting: null,
    question: 'Do you smoke?'
  },
  'substance-use-drink': {
    greeting: null,
    question: 'Do you drink alcohol?'
  },
  'pregnancy-status': {
    greeting: null,
    question: 'Are you pregnant?'
  },
  'pregnancy-feeling': {
    greeting: (userName) => userName ? `Congratulations, ${userName}!` : 'Congratulations!',
    question: (userName) => `${userName ? userName + ', how' : 'How'} are you feeling?`
  },
  'folic-acid': {
    greeting: null,
    question: 'Are you taking folic acid?'
  },
  'due-date-known': {
    greeting: null,
    question: 'Do you know your due date?'
  },
  'emergency-contact': {
    greeting: null,
    question: 'Who should we contact in an emergency?'
  }
};

const QuestionCard = ({ question, value, onChange, onSubmit, onSkip, saving }) => {
  const [birthYear, setBirthYear] = useState('');
  const [userName, setUserName] = useState('');
  const [dueDateInput, setDueDateInput] = useState({ day: '', month: '', year: '' });
  const [lastPeriodInput, setLastPeriodInput] = useState({ day: '', month: '' });
  const [medications, setMedications] = useState(['']);
  
  // Get tailored prompt or use original
  const tailored = tailoredPrompts[question.slug];
  const displayQuestion = typeof tailored?.question === 'function' 
    ? tailored.question(userName)
    : tailored?.question || question.prompt;
  const greeting = typeof tailored?.greeting === 'function'
    ? tailored.greeting(userName)
    : tailored?.greeting;

  const renderResponseField = () => {
    // Handle birth year for age question
    if (question.slug === 'mama-age') {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear - 60; year <= currentYear - 13; year++) {
        years.push(year);
      }
      
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="question-card__select"
        >
          <option value="">Select year</option>
          {years.reverse().map(year => (
            <option key={year} value={currentYear - year}>{year}</option>
          ))}
        </select>
      );
    }

    // Handle country selection
    if (question.slug === 'mama-region') {
      const countries = [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
        'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
        'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
        'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
        'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
        'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
        'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
        'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
        'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
        'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar',
        'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
        'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
        'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Palau',
        'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
        'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
        'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
        'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
        'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
        'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
        'Yemen', 'Zambia', 'Zimbabwe'
      ];
      
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="question-card__select"
        >
          <option value="">Select country</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      );
    }

    // Handle simple name input
    if (question.slug === 'mama-name') {
      return (
        <input
          type="text"
          className="question-card__input-simple"
          placeholder="Your name"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      );
    }

    // Handle separated smoke/drink questions
    if (question.slug === 'substance-use-smoke' || question.slug === 'substance-use-drink') {
      const options = ['Never', 'Occasionally', 'Yes'];
      return (
        <div className="question-card__options">
          {options.map((option) => (
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
    }

    // Handle pregnancy status question with custom options
    if (question.slug === 'pregnancy-status') {
      const options = ['No, I want to be', 'Yes, I am'];
      return (
        <div className="question-card__options">
          {options.map((option) => (
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
    }

    // Handle pregnancy feeling question
    if (question.slug === 'pregnancy-feeling') {
      const options = ['Excited and happy', 'A bit nervous', 'Overwhelmed', 'Tired but hopeful'];
      return (
        <div className="question-card__options">
          {options.map((option) => (
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
    }

    // Handle folic acid question
    if (question.slug === 'folic-acid') {
      const options = ['Yes', 'No'];
      return (
        <div>
          <div className="question-card__options">
            {options.map((option) => (
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
          {value === 'Yes' && (
            <div className="question-card__info-box" style={{ marginTop: '20px', padding: '16px', background: 'rgba(79, 179, 166, 0.1)', borderRadius: '16px', color: 'var(--slate-700)' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>Great! You're doing amazing! 💚</p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                The recommended dose is <strong>400-800 mcg (0.4-0.8 mg) daily</strong>. Take it every day, especially during the first 12 weeks of pregnancy when your baby's neural tube is developing.
              </p>
            </div>
          )}
          {value === 'No' && (
            <div className="question-card__info-box" style={{ marginTop: '20px', padding: '16px', background: 'rgba(240, 132, 174, 0.1)', borderRadius: '16px', color: 'var(--slate-700)' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>We recommend starting folic acid soon! 💊</p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                Folic acid helps prevent neural tube defects. Take <strong>400-800 mcg (0.4-0.8 mg) daily</strong>, ideally starting before conception and continuing through the first 12 weeks of pregnancy.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Handle due date known question
    if (question.slug === 'due-date-known') {
      const options = ['Yes', 'No, calculate it for me'];
      return (
        <div>
          <div className="question-card__options">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={value?.choice === option ? 'active' : ''}
                onClick={() => onChange({ choice: option, date: null })}
              >
                {option}
              </button>
            ))}
          </div>
          {value?.choice === 'Yes' && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--slate-600)' }}>Enter your due date</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="DD"
                  maxLength="2"
                  value={dueDateInput.day}
                  onChange={(e) => {
                    const day = e.target.value.replace(/\D/g, '');
                    setDueDateInput({ ...dueDateInput, day });
                    if (day && dueDateInput.month && dueDateInput.year) {
                      onChange({ choice: 'Yes', date: `${dueDateInput.year}-${dueDateInput.month.padStart(2, '0')}-${day.padStart(2, '0')}` });
                    }
                  }}
                  style={{ width: '70px', padding: '12px', textAlign: 'center', border: '2px solid var(--pink-200)', borderRadius: '16px', fontSize: '1rem' }}
                />
                <input
                  type="text"
                  placeholder="MM"
                  maxLength="2"
                  value={dueDateInput.month}
                  onChange={(e) => {
                    const month = e.target.value.replace(/\D/g, '');
                    setDueDateInput({ ...dueDateInput, month });
                    if (dueDateInput.day && month && dueDateInput.year) {
                      onChange({ choice: 'Yes', date: `${dueDateInput.year}-${month.padStart(2, '0')}-${dueDateInput.day.padStart(2, '0')}` });
                    }
                  }}
                  style={{ width: '70px', padding: '12px', textAlign: 'center', border: '2px solid var(--pink-200)', borderRadius: '16px', fontSize: '1rem' }}
                />
                <input
                  type="text"
                  placeholder="YYYY"
                  maxLength="4"
                  value={dueDateInput.year}
                  onChange={(e) => {
                    const year = e.target.value.replace(/\D/g, '');
                    setDueDateInput({ ...dueDateInput, year });
                    if (dueDateInput.day && dueDateInput.month && year) {
                      onChange({ choice: 'Yes', date: `${year}-${dueDateInput.month.padStart(2, '0')}-${dueDateInput.day.padStart(2, '0')}` });
                    }
                  }}
                  style={{ width: '90px', padding: '12px', textAlign: 'center', border: '2px solid var(--pink-200)', borderRadius: '16px', fontSize: '1rem' }}
                />
              </div>
            </div>
          )}
          {value?.choice === 'No, calculate it for me' && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--slate-600)' }}>Enter the date your last period started. An estimation is fine for now.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '300px', margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="DD"
                  maxLength="2"
                  value={lastPeriodInput.day}
                  onChange={(e) => {
                    const day = e.target.value.replace(/\D/g, '');
                    setLastPeriodInput({ ...lastPeriodInput, day });
                    if (day && lastPeriodInput.month) {
                      // Calculate due date: add 280 days (40 weeks) to last period date
                      const currentYear = new Date().getFullYear();
                      const lastPeriod = new Date(currentYear, parseInt(lastPeriodInput.month) - 1, parseInt(day));
                      const dueDate = new Date(lastPeriod.getTime() + (280 * 24 * 60 * 60 * 1000));
                      onChange({ 
                        choice: 'No, calculate it for me', 
                        date: dueDate.toISOString().split('T')[0],
                        lastPeriod: `${currentYear}-${lastPeriodInput.month.padStart(2, '0')}-${day.padStart(2, '0')}`
                      });
                    }
                  }}
                  style={{ width: '70px', padding: '12px', textAlign: 'center', border: '2px solid var(--pink-200)', borderRadius: '16px', fontSize: '1rem' }}
                />
                <input
                  type="text"
                  placeholder="MM"
                  maxLength="2"
                  value={lastPeriodInput.month}
                  onChange={(e) => {
                    const month = e.target.value.replace(/\D/g, '');
                    setLastPeriodInput({ ...lastPeriodInput, month });
                    if (lastPeriodInput.day && month) {
                      // Calculate due date: add 280 days (40 weeks) to last period date
                      const currentYear = new Date().getFullYear();
                      const lastPeriod = new Date(currentYear, parseInt(month) - 1, parseInt(lastPeriodInput.day));
                      const dueDate = new Date(lastPeriod.getTime() + (280 * 24 * 60 * 60 * 1000));
                      onChange({ 
                        choice: 'No, calculate it for me', 
                        date: dueDate.toISOString().split('T')[0],
                        lastPeriod: `${currentYear}-${month.padStart(2, '0')}-${lastPeriodInput.day.padStart(2, '0')}`
                      });
                    }
                  }}
                  style={{ width: '70px', padding: '12px', textAlign: 'center', border: '2px solid var(--pink-200)', borderRadius: '16px', fontSize: '1rem' }}
                />
              </div>
              {value?.date && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(79, 179, 166, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>Estimated due date:</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--teal-600)', marginTop: '4px' }}>
                    {new Date(value.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Handle emergency contact question
    if (question.slug === 'emergency-contact') {
      const emergencyData = typeof value === 'object' && value ? value : { number: '', relation: '' };
      return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--slate-600)' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              value={emergencyData.number || ''}
              onChange={(e) => onChange({ ...emergencyData, number: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
                border: '2px solid var(--pink-200)', 
                borderRadius: '16px', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--pink-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--pink-200)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--slate-600)' }}>
              Relation
            </label>
            <input
              type="text"
              placeholder="e.g., Partner, Mother, Sister"
              value={emergencyData.relation || ''}
              onChange={(e) => onChange({ ...emergencyData, relation: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
                border: '2px solid var(--pink-200)', 
                borderRadius: '16px', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--pink-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--pink-200)'}
            />
          </div>
        </div>
      );
    }

    // Handle current medications with multiple input boxes
    if (question.slug === 'current-meds') {
      const medsList = Array.isArray(value) ? value : (value ? [value] : ['']);
      
      const handleMedChange = (index, val) => {
        const updated = [...medsList];
        updated[index] = val;
        // Filter out empty values except the last one
        const filtered = updated.filter((med, i) => med.trim() !== '' || i === updated.length - 1);
        onChange(filtered.length > 0 ? filtered : ['']);
      };

      const addMedication = () => {
        onChange([...medsList, '']);
      };

      const removeMedication = (index) => {
        if (medsList.length === 1) {
          onChange(['']);
        } else {
          const updated = medsList.filter((_, i) => i !== index);
          onChange(updated);
        }
      };

      return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {medsList.map((med, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="e.g., Prenatal vitamins"
                value={med}
                onChange={(e) => handleMedChange(index, e.target.value)}
                className="question-card-minimal__input-simple"
                style={{ 
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '1rem'
                }}
              />
              {medsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid var(--pink-300)',
                    background: 'white',
                    color: 'var(--pink-500)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--pink-500)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'var(--pink-500)';
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '24px',
              border: '2px dashed var(--pink-300)',
              background: 'transparent',
              color: 'var(--pink-500)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--pink-500)';
              e.target.style.background = 'rgba(240, 132, 174, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--pink-300)';
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '24px', lineHeight: '1' }}>+</span>
            <span>Add medication</span>
          </button>
        </div>
      );
    }

    // Handle allergies with multiple input boxes
    if (question.slug === 'allergies') {
      const allergyList = Array.isArray(value) ? value : (value ? [value] : ['']);
      
      const handleAllergyChange = (index, val) => {
        const updated = [...allergyList];
        updated[index] = val;
        // Filter out empty values except the last one
        const filtered = updated.filter((allergy, i) => allergy.trim() !== '' || i === updated.length - 1);
        onChange(filtered.length > 0 ? filtered : ['']);
      };

      const addAllergy = () => {
        onChange([...allergyList, '']);
      };

      const removeAllergy = (index) => {
        if (allergyList.length === 1) {
          onChange(['']);
        } else {
          const updated = allergyList.filter((_, i) => i !== index);
          onChange(updated);
        }
      };

      return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {allergyList.map((allergy, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="e.g., Peanuts, Penicillin"
                value={allergy}
                onChange={(e) => handleAllergyChange(index, e.target.value)}
                className="question-card-minimal__input-simple"
                style={{ 
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '1rem'
                }}
              />
              {allergyList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid var(--pink-300)',
                    background: 'white',
                    color: 'var(--pink-500)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--pink-500)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'var(--pink-500)';
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAllergy}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '24px',
              border: '2px dashed var(--pink-300)',
              background: 'transparent',
              color: 'var(--pink-500)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--pink-500)';
              e.target.style.background = 'rgba(240, 132, 174, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--pink-300)';
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '24px', lineHeight: '1' }}>+</span>
            <span>Add allergy</span>
          </button>
        </div>
      );
    }

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
    <article className="question-card-minimal">
      {greeting && (
        <p className="question-card-minimal__greeting">{greeting}</p>
      )}
      <h2 className="question-card-minimal__question">{displayQuestion}</h2>
      {question.helpText && !tailored && (
        <p className="question-card-minimal__help">{question.helpText}</p>
      )}
      {renderResponseField()}
      <div className="question-card-minimal__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onSubmit}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
        {!question.isRequired && question.allowAnswerLater && (
          <button type="button" className="button button--ghost" onClick={onSkip} disabled={saving}>
            Skip for now
          </button>
        )}
      </div>
    </article>
  );
};

export default QuestionCard;
