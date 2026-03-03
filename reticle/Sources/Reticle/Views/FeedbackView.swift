import SwiftUI

struct FeedbackView: View {
    var body: some View {
        ContentUnavailableView(
            "Feedback",
            systemImage: "bubble.left.and.bubble.right",
            description: Text("Feedback review coming soon.")
        )
        .navigationTitle("Feedback")
    }
}
