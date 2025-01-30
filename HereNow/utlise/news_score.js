export default function calculatePopularityScore(newsItem) {
    if (!newsItem) {
        return 0;
    }

    let score = 0;

    // Add points based on the number of comments
    if (Array.isArray(newsItem.newsComments)) {
        score += newsItem.newsComments.length * 1; // 1 point per comment
    }

    // Add points based on ratings
    if (newsItem.rating && Array.isArray(newsItem.rating)) {

          // Calculate the total points based on ratings
                newsItem.rating.forEach(rating => {
            if (rating.ratingValue === 1) {
                score += 1; // Rating 1 gives 1 point
            } else if (rating.ratingValue === 2) {
                score += 3; // Rating 2 gives 3 points
            } else if (rating.ratingValue === 3) {
                score += 9; // Rating 3 gives 9 points
            }
        });
    }else{
        console.log("The dat is wrong")
    }
console.log(`score${score}`);
    return score;
}
