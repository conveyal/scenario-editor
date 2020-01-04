# Overview of network editing

After selecting a project, you will arrive at the modifications page, shown below. Each project has an expandable list of numbered **scenarios** followed by a list of **modifications** grouped by type. Each modification represents a single operation on the :term:`baseline network` (for example adding a line, or adjusting the speed of an existing line) and can be [activated](#activating-modifications-in-scenarios) in multiple scenarios. Scenarios are a way of grouping isolated modifications into meaningful units representing changes to the broader network. For example, you could create a scenario representing each of several funding scenarios with one for service cuts, one for extended service and so on. 

<figure>
  <img src="../img/create-scenario.png" />
  <figcaption>Initial view in editing mode for an established project</figcaption>
</figure>

To prevent data conflicts, the system does not support multiple users or browser tabs editing the same project simultaneously. If you expect multiple people in your organization to be using Conveyal Analysis at the same time, you may want to create projects for each of them. Projects based on the same GTFS bundle can share modifications by [exporting](export.html) from one project and importing into another.

## Create a new modification

To add a modification, first navigate to the modification page (the <i class="fa fa-pencil"></i> icon). You will need to select a project if you haven't already. If your project is selected you should see the following button below the project name. 

<span class="btn btn-success"><i class="fa fa-plus"></i> Create a modification</span>


This will open a window prompting you to select the [modification type](modifications.html) and enter a name for the modification. Choose a descriptive name - you will generally want to include at least the name of the route created or effected by the modification. After confirming these details, you will be taken to a page displaying options that vary by modification type.

## Create a new scenario

From the modifications page, you can also create and edit scenarios. A scenario is used for grouping modifications into meaningful units representing broader changes to the network. 
You may need to click the scenarios bar to expand it. Once expanded, you should see the baseline scenario and any others that you have created. Click the button to create a new scenario and give it a name e.g. "_Expanded BRT_" or "_Downtown Stop Consolidation_".
When editing modifications, you may opt to add them to one or more scenarios. 
