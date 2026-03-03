import SwiftUI

enum SidebarSection: String, CaseIterable, Identifiable {
    case people = "People"
    case feedback = "Feedback"
    case messages = "Messages"
    case todos = "To-dos"
    case goals = "Goals"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .people: return "person.2"
        case .feedback: return "bubble.left.and.bubble.right"
        case .messages: return "envelope"
        case .todos: return "checklist"
        case .goals: return "target"
        }
    }

    var isAvailable: Bool {
        switch self {
        case .people, .feedback: return true
        default: return false
        }
    }
}

struct ContentView: View {
    @State private var selectedSection: SidebarSection = .feedback

    var body: some View {
        NavigationSplitView {
            List(SidebarSection.allCases, selection: $selectedSection) { section in
                Label(section.rawValue, systemImage: section.icon)
                    .foregroundStyle(section.isAvailable ? .primary : .tertiary)
                    .tag(section)
            }
            .navigationSplitViewColumnWidth(160)
        } detail: {
            switch selectedSection {
            case .people:
                PeopleView()
            case .feedback:
                FeedbackView()
            default:
                ContentUnavailableView(
                    "\(selectedSection.rawValue) Coming Soon",
                    systemImage: selectedSection.icon,
                    description: Text("This section is under construction.")
                )
            }
        }
        .navigationTitle("Reticle")
    }
}
