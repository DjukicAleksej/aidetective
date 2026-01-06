import { InvestigationCase } from './types';

export const MOCK_CASES: InvestigationCase[] = [
  {
    id: 'case-001',
    title: 'The Inheritor\'s Silence',
    description: 'A wealthy patriarch, Arthur Sterling, was found dead in his locked study. No sign of struggle, but the scent of bitter almonds lingers in the air.',
    status: 'Open',
    parties: [
      {
        id: 's1',
        name: 'Julian Sterling',
        role: 'Disinherited Son',
        description: 'The estranged eldest son, returned from abroad only three days ago. Known for his gambling debts.',
        alibi: 'Claims to have been at the local tavern, The Rusty Anchor, until 11:00 PM.',
        motive: 'Desperate for his inheritance to clear mounting debts in Monte Carlo.',
        notes: 'He was seen arguing with Arthur on the morning of the murder.',
        imageUrl: 'https://picsum.photos/seed/julian/400/500'
      },
      {
        id: 's2',
        name: 'Elena Vance',
        role: 'The Devoted Housekeeper',
        description: 'Served the Sterling family for thirty years. Knows every secret of the house.',
        alibi: 'States she was preparing the guest rooms in the East Wing.',
        motive: 'Arthur recently announced he was selling the estate, which would leave her homeless.',
        notes: 'Has a curious knowledge of medicinal herbs and poisons.',
        imageUrl: 'https://picsum.photos/seed/elena/400/500'
      },
      {
        id: 's3',
        name: 'Marcus Thorne',
        role: 'Business Rival',
        description: 'A cunning industrialist who lost a major contract to Arthur last month.',
        alibi: 'Was seen entering his own residence at 10:30 PM by his chauffeur.',
        motive: 'Removing Arthur would allow Marcus to acquire the Sterling patents at auction.',
        notes: 'His presence at the Sterling party was uninvited.',
        imageUrl: 'https://picsum.photos/seed/marcus/400/500'
      }
    ],
    clues: [
      {
        id: 'c1',
        title: 'Empty Vial',
        description: 'A small glass vial found tucked behind the heavy velvet curtains. Traces of cyanide detected.',
        source: 'Crime Scene / Study',
        confidence: 'Confirmed'
      },
      {
        id: 'c2',
        title: 'Unsigned Letter',
        description: 'A letter found in the fireplace, partially burnt. Mentions a "final warning" regarding the gambling debts.',
        source: 'Arthur\'s Desk',
        confidence: 'Confirmed'
      },
      {
        id: 'c3',
        title: 'Smudged Footprint',
        description: 'A muddy footprint on the terrace outside the study window. Appears to be a size 10 boot.',
        source: 'Terrace',
        confidence: 'Questionable'
      }
    ],
    timeline: [
      {
        id: 't1',
        time: '08:00 PM',
        date: '2024-05-15',
        description: 'The dinner party concludes. Guests retire to the drawing room.',
        involvedSuspects: ['s1', 's2', 's3']
      },
      {
        id: 't2',
        time: '09:30 PM',
        date: '2024-05-15',
        description: 'Arthur Sterling enters his study and locks the door.',
        involvedSuspects: []
      },
      {
        id: 't3',
        time: '10:15 PM',
        date: '2024-05-15',
        description: 'A brief argument is heard through the study door.',
        involvedSuspects: ['s1'],
        isGap: true
      },
      {
        id: 't4',
        time: '11:00 PM',
        date: '2024-05-15',
        description: 'Elena Vance knocks on the study door to offer tea. No response.',
        involvedSuspects: ['s2']
      }
    ],
    statements: [
      {
        id: 'st1',
        speakerId: 's1',
        speakerName: 'Julian Sterling',
        content: 'I didn\'t even see him after dinner. I went straight to the tavern. Ask anyone there.',
        timestamp: '11:45 PM',
        context: 'Initial interview at police station'
      },
      {
        id: 'st2',
        speakerId: 's2',
        speakerName: 'Elena Vance',
        content: 'I heard voices around ten. Angry voices. But the master often talked to himself when he was stressed.',
        timestamp: '00:15 AM',
        context: 'Interview at the estate'
      },
      {
        id: 'st3',
        speakerId: 's3',
        speakerName: 'Marcus Thorne',
        content: 'I left early. Business to attend to. I have no interest in Sterling\'s personal affairs.',
        timestamp: '09:00 PM',
        context: 'Phone interview'
      },
      {
        id: 'st4',
        speakerId: 's1',
        speakerName: 'Julian Sterling',
        content: 'Yes, we argued. About money. But I didn\'t kill him. I couldn\'t have—I was at the tavern.',
        timestamp: '12:30 PM',
        context: 'Follow-up interview'
      }
    ],
    theories: [
      {
        id: 'th1',
        title: 'The Prodigal Son\'s Revenge',
        content: 'Julian used the argument at 10:15 PM to deliver the poison. The letter in the fireplace confirms Arthur was pressuring him.',
        linkedClues: ['c2', 'c1'],
        linkedSuspects: ['s1'],
        createdAt: new Date().toISOString()
      }
    ]
  }
];

