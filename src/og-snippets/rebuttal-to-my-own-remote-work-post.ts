// Proximity is measured against your team, not against a building.
// Emanuel, Harrington & Pallais — software engineers, Fortune 500, 2019-2024.
type Engineer = { building: 'hq-north' | 'hq-south'; team: Engineer[] };

const BASELINE = 8.03; // review comments per program, split-team engineers

export const commentsFor = (eng: Engineer) =>
  eng.team.every((mate) => mate.building === eng.building)
    ? BASELINE * 1.239 // whole team co-located: +23.9% comments
    : BASELINE; //       team split across two buildings: no gain

// Both groups commuted. Both badged in. Both sat at a desk.
// Only one had the reviewers in the room.
//
// Gains land on junior engineers; seniors write less code when co-located,
// because they spend the hours reviewing. Dose the whole team, not the week.
