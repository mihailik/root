<reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Conceptually, every row in the TableKind.Param table is owned by one, and only one, row in the TableKind.MethodDef  table.
	//The rows in the TableKind.Param table result from the parameters in a method declaration (ECMA-335 §15.4),
	//or from a .param attribute attached to a method (ECMA-335 §15.4.1).
	//[ECMA-335 §22.33]
	export class Param {
		parameterDefinition: ParameterDefinition;

		//Sequence shall have a value >= 0 and <= number of parameters in owner method.
		//A  Sequence value of 0 refers to the owner method‘s return type;
		//its parameters are then numbered from 1 onwards  [ERROR]
		//Successive rows of the TableKind.Param table that are owned by the same method
		//shall be ordered by increasing Sequence value -
		//although gaps in the sequence are allowed  [WARNING]
		sequence: ushort;

		read(reader: io.BinaryReader): void {
			this.parameterDefinition = new ParameterDefinition();
			this.parameterDefinition.Attributes = (ParamAttributes)reader.readUShort();
			this.sequence = reader.readUShort();
			this.parameterDefinition.Name = reader.readString();
		}
	}
}