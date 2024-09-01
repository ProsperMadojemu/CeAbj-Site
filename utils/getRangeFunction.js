
function getDateRange(option) {
    const today = new Date();
    let startDate;
    let endDate = new Date(today);

    switch (option) {
        case "lastSunday":
            // Calculate the date for the last Sunday
            const dayOfWeek = today.getDay();
            const daysSinceSunday = (dayOfWeek + 7 - 0) % 7; // 0 is Sunday
            endDate.setDate(today.getDate() - daysSinceSunday);
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            break;
        case "pastMonth":
            startDate = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );
            break;
        default:
            startDate = new Date(0); // Default to all time
    }

    return { $gte: startDate, $lt: endDate };
}

export default getDateRange;