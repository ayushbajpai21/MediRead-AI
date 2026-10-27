/**
 * Generates an .ics iCalendar file for prescribed medicine reminders.
 */
export function generateMedicineIcs(medicines = [], doctorName = "Doctor") {
  if (!medicines || medicines.length === 0) return null;

  const now = new Date();
  const formatIcsDate = (date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MediRead AI//Prescription Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  medicines.forEach((med, idx) => {
    if (!med.name) return;

    // Default schedules
    let times = ["090000"]; // Default morning
    const freq = (med.frequency || "").toUpperCase();

    if (freq === "BD" || freq === "BID") {
      times = ["090000", "210000"];
    } else if (freq === "TDS" || freq === "TID") {
      times = ["080000", "140000", "200000"];
    } else if (freq === "HS") {
      times = ["220000"];
    } else if (freq === "SOS") {
      times = []; // Not scheduled
    }

    // Number of days (default 5 if not found)
    let days = 5;
    const durMatch = (med.duration || "").match(/(\d+)/);
    if (durMatch) {
      days = parseInt(durMatch[1], 10);
    }

    times.forEach((timeStr, tIdx) => {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const startDateTime = `${year}${month}${day}T${timeStr}`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:mediread-${Date.now()}-${idx}-${tIdx}@mediread.ai`,
        `DTSTAMP:${formatIcsDate(now)}`,
        `DTSTART:${startDateTime}`,
        `RRULE:FREQ=DAILY;COUNT=${days}`,
        `SUMMARY:Take ${med.name} ${med.strength ? "(" + med.strength + ")" : ""}`,
        `DESCRIPTION:Dose: ${med.dosage || "1 dose"}\\nTiming: ${med.timing || "As instructed"}\\nInstructions: ${med.instructions || "Follow prescription"}\\nDoctor: ${doctorName}`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT10M",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder to take ${med.name}`,
        "END:VALARM",
        "END:VEVENT"
      );
    });
  });

  icsContent.push("END:VCALENDAR");
  return icsContent.join("\r\n");
}

export function downloadCalendarFile(medicines, doctorName) {
  const ics = generateMedicineIcs(medicines, doctorName);
  if (!ics) return;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `MediRead_Medication_Schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
