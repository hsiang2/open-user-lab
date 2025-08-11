import { hashSync } from "bcrypt-ts-edge";

const sampleData = {
  "users": [
    {
      "id": "user1",
      "name": "Alice",
      "email": "alice@example.com",
      "password": hashSync('123456', 10),
      "isResearcher": true,
      "institution": "Example University",
      "profile": {
        "birth": "1995-06-15T00:00:00.000Z",
        "gender": "female",
        "language": ["English"],
        "website": "https://alice-lab.example.com",
        "region": "UK",
        "background": ["Psychology", "Design"],
        "avatarBase": "style_brown",
        "avatarAccessory": "accessory_researcher_office",
        "avatarBg": "bg_blue"
      }
    },
    {
      "id": "user2",
      "name": "Bob",
      "email": "bob@example.com",
      "password": hashSync('123456', 10),
      "isResearcher": false,
      "institution": null,
      "profile": {
        "birth": "1998-03-22T00:00:00.000Z",
        "gender": "male",
        "language": ["English"],
        "website": null,
        "region": "UK",
        "background": ["Psychology"],
        "avatarBase": "style_white",
        "avatarAccessory": "None",
        "avatarBg": "bg_green"
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
          "value": ["English"],
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
        "format": ["Online"],
        "duration": 15,
        "image": "color-study.jpg",
        "thankYouMessage": "Thanks for joining!",
        "avatarResearcher": "base_brown",
        "criteriaDescription": "We are looking for adults aged 18–30 who speak English and are familiar with mobile apps.",
        "sessionDetail": "The study will take around 20 minutes and can be completed online using your own device."
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
  