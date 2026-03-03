import SwiftUI

struct PeopleView: View {
    var body: some View {
        ContentUnavailableView(
            "People",
            systemImage: "person.2",
            description: Text("People management coming soon.")
        )
        .navigationTitle("People")
    }
}
