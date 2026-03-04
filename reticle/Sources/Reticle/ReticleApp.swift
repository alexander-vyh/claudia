import SwiftUI

@main
struct ReticleApp: App {
    @StateObject private var gateway = GatewayClient()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(gateway)
                .frame(minWidth: 800, minHeight: 500)
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}
