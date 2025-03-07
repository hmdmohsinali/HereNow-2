export default function eventScoreCalculation(events) {
    if (!events || typeof events !== "object") {
        return 0; // Return 0 if events is null, undefined, or not an object
    }

    let score = 0;

    // Calculate score from comments
    if (Array.isArray(events.comment)) {
        score += events.comment.length; // Each comment adds 1 point
    }
    console.log(`Comments--Length=>${events.comment.length}`);

    // Calculate score from ratings
    if (Array.isArray(events.rating)) {
        events.forEach((rating) => {
            console.log(`Rating Object:${JSON.stringify(rating)}`);
            const ratingValue = rating.ratingValue; // Extract the ratingValue field
            if (ratingValue === 1) {
                score += 1; // 1-star rating adds 1 point
            } else if (ratingValue === 2) {
                score += 3; // 2-star rating adds 3 points
            } else if (ratingValue === 3) {
                score += 9; // 3-star rating adds 9 points
            }
        });
    }
    console.log(`Calculated Score: ${score}`);
    return score;
}   