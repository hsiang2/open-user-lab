const sampleData = {
  "users": [
    {
      "id": "user1",
      "name": "Alice",
      "email": "alice@example.com",
      "password": "hashedpassword1",
      "isResearcher": true,
      "institution": "Example University",
      "profile": {
        "birth": "1995-06-15T00:00:00.000Z",
        "gender": "female",
        "language": "en",
        "website": "https://alice-lab.example.com",
        "region": "UK",
        "background": "HCI researcher",
        "avatarBase": "cat",
        "avatarAccessory": "hat",
        "avatarBg": "blue"
      }
    },
    {
      "id": "user2",
      "name": "Bob",
      "email": "bob@example.com",
      "password": "hashedpassword2",
      "isResearcher": false,
      "institution": null,
      "profile": {
        "birth": "1998-03-22T00:00:00.000Z",
        "gender": "male",
        "language": "en",
        "website": null,
        "region": "UK",
        "background": "Interested in psychology studies",
        "avatarBase": "dog",
        "avatarAccessory": "glasses",
        "avatarBg": "green"
      }
    }
  ],
  "studies": [
    {
      "id": "study1",
      "name": "Color Perception Study",
      "slug": "color-perception-study",
      "description": "A study about how people perceive colour in different contexts.",
      "status": "draft",
      "recruitmentStatus": "open",
      "createdAt": '2025-07-01T10:00:00Z',
      "collaborators": [
        {
          "userId": "user1",
          "role": "owner"
        }
      ],
      "criteria": [
        {
          "type": "language",
          "value": "en",
          "matchLevel": "Required"
        }
      ],
      "form": {
        "id": "form1",
        "description": "Initial screening form",
        "questions": [
          {
            "id": "q1",
            "text": "What is your favourite colour?",
            "type": "text",
            "required": true,
            "evaluationType": "none",
            "options": []
          }
        ]
      },
      "recruitment": {
        "description": "Recruiting participants interested in colour studies.",
        "reward": "\u00a310 Amazon voucher",
        "format": "online",
        "duration": "15 minutes",
        "image": "color-study.jpg",
        "thankYouMessage": "Thanks for joining!"
      }
    }
  ],
  "participations": [
    {
      "id": "part1",
      "userId": "user2",
      "studyId": "study1",
      "status": "Applied",
      "inviteStatus": "pending",
      "appliedAt": "2025-07-10T10:00:00.000Z",
      "invitedAt": null,
      "formResponses": [
        {
          "id": "resp1",
          "formId": "form1",
          "submittedAt": "2025-07-11T15:30:00.000Z",
          "answers": [
            {
              "id": "a1",
              "questionId": "q1",
              "text": "Blue",
              "selectedOptions": []
            }
          ]
        }
      ]
    }
  ]
};
  
  export default sampleData;
  