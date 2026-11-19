import { MOCK_POINTS } from "@/data/mockPointsConfig";
import type { PointAction } from "@/types/points";

/**
 * Acciones disponibles para ganar puntos en KM0 LAB.
 *
 * MOCK: refleja las acciones configuradas en el panel de puntos.
 * - completed: true → el usuario ya ha obtenido los puntos.
 * - completed: false → acción pendiente por realizar.
 */
export const POINTS_ACTIONS: PointAction[] = [
  {
    id: "birthday",
    apiType: "birthday",
    titleKey: "points.actions.birthday.title",
    descriptionKey: "points.actions.birthday.description",
    typeKey: "points.actions.type.birthday",
    points: MOCK_POINTS.birthday,
    completed: false,
    icon: "cake",
  },
  {
    id: "signup",
    apiType: "signup",
    titleKey: "points.actions.signup.title",
    descriptionKey: "points.actions.signup.description",
    typeKey: "points.actions.type.signup",
    points: MOCK_POINTS.signup,
    completed: true,
    icon: "user-plus",
  },
  {
    id: "first_scan",
    apiType: "first_scan",
    titleKey: "points.actions.first_scan.title",
    descriptionKey: "points.actions.first_scan.description",
    typeKey: "points.actions.type.first_scan",
    points: MOCK_POINTS.firstScan,
    completed: true,
    icon: "star",
  },
  {
    id: "scan",
    apiType: "scan",
    titleKey: "points.actions.scan.title",
    descriptionKey: "points.actions.scan.description",
    typeKey: "points.actions.type.scan",
    points: MOCK_POINTS.scan,
    completed: false,
    icon: "qr",
  },
  {
    id: "web_visit",
    apiType: "web_visit",
    titleKey: "points.actions.web_visit.title",
    descriptionKey: "points.actions.web_visit.description",
    typeKey: "points.actions.type.web_visit",
    points: MOCK_POINTS.webVisit,
    completed: false,
    icon: "globe",
  },
  {
    id: "newsletter",
    apiType: "newsletter",
    titleKey: "points.actions.newsletter.title",
    descriptionKey: "points.actions.newsletter.description",
    typeKey: "points.actions.type.newsletter",
    points: 30,
    completed: false,
    icon: "mail",
  },
  {
    id: "event_signup",
    apiType: "event_signup",
    titleKey: "points.actions.event_signup.title",
    descriptionKey: "points.actions.event_signup.description",
    typeKey: "points.actions.type.event_signup",
    points: MOCK_POINTS.eventSignup,
    completed: false,
    icon: "calendar-check",
  },
  {
    id: "survey",
    apiType: "survey",
    titleKey: "points.actions.survey.title",
    descriptionKey: "points.actions.survey.description",
    typeKey: "points.actions.type.survey",
    points: MOCK_POINTS.survey,
    completed: false,
    icon: "clipboard-list",
  },
];
