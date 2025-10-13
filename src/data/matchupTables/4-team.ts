/**
 * @fileoverview 4-Team Round-Robin Schedule
 *
 * Complete round-robin schedule for 4 teams.
 * Each team plays every other team multiple times over 12 weeks.
 * Week number = array index + 1
 */

export const fourTeamSchedule = [
  [[1, 2], [3, 4]], // Week 1
  [[3, 1], [4, 2]], // Week 2
  [[2, 3], [1, 4]], // Week 3
  [[3, 4], [2, 1]], // Week 4
  [[4, 2], [1, 3]], // Week 5
  [[1, 4], [3, 2]], // Week 6
  [[2, 1], [4, 3]], // Week 7
  [[1, 3], [2, 4]], // Week 8
  [[3, 2], [4, 1]], // Week 9
  [[4, 3], [1, 2]], // Week 10
  [[2, 4], [3, 1]], // Week 11
  [[4, 1], [2, 3]], // Week 12
];
