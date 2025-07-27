const sampleData = {
    users: [
      {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        is_researcher: true,
        profile: {
          institution: 'Example University',
          gender: 'female',
          birth: '1995-06-15',
          language: 'en',
          avatar_base: 'cat',
          avatar_accessory: 'hat',
          avatar_bg: 'blue',
          registration: '2025-07-01',
          background: 'HCI researcher',
          website: 'https://alice-lab.example.com'
        }
      },
      {
        id: 'user2',
        name: 'Bob',
        email: 'bob@example.com',
        is_researcher: false,
        profile: {
          institution: null,
          gender: 'male',
          birth: '1998-03-22',
          language: 'en',
          avatar_base: 'dog',
          avatar_accessory: 'glasses',
          avatar_bg: 'green',
          registration: '2025-07-02',
          background: 'Interested in psychology studies',
          website: null
        }
      }
    ],
  
    studies: [
      {
        id: 'study1',
        name: 'Color Perception Study',
        description: 'A study about how people perceive colour in different contexts.',
        status: 'draft', // or ongoing, ended
        recruitment_status: 'open',
        created_by: 'user1'
      },
    ],
  
    participations: [
      {
        id: 'part1',
        user_id: 'user2',
        study_id: 'study1',
        status: 'applied',
        applied_at: '2025-07-10T10:00:00Z',
        invitation_status: null,
        invited_at: null
      }
    ],
  
    forms: [
      {
        id: 'form1',
        study_id: 'study1',
        description: 'Initial screening form'
      }
    ],
  
    form_questions: [
      {
        id: 'q1',
        form_id: 'form1',
        text: 'What is your favourite colour?',
        type: 'text',
        required: true,
        evaluation_type: 'none'
      }
    ],
  
    form_responses: [
      {
        id: 'resp1',
        form_id: 'form1',
        participation_id: 'part1',
        submitted_at: '2025-07-11T15:30:00Z',
        answers: [
          {
            id: 'a1',
            question_id: 'q1',
            text: 'Blue',
            selected_option_id: null
          }
        ]
      }
    ]
  };
  
  export default sampleData;
  